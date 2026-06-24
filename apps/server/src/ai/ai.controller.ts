import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { parseGuideText } from '../trips/parse-guide';
import { TripsService } from '../trips/trips.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/auth.types';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { GeoService } from '../geo/geo.service';
import { ParseGuideDto } from './dto/parse-guide.dto';
import { PlanItineraryDto } from './dto/plan-itinerary.dto';
import { ReviseTripDto } from './dto/revise-trip.dto';
import { itineraryToCreateTripDto, itineraryToUpdateFields } from './itinerary.mapper';
import { sanitizeItinerary } from './itinerary-sanitize';
import { countPlaces } from '../trips/trip-builder';
import {
  applyDeterministicRevision,
  hasItineraryChanges,
  summarizeItineraryChanges,
  tripToItinerarySnapshot,
} from './itinerary-revision.utils';
import { PlanAgentService } from './plan-agent.service';
import type { PlanAgentLog, PlanAgentLogKind } from './plan-agent.types';

type ReviseLogHandler = (kind: PlanAgentLogKind, text: string) => void;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiOrchestrator: AiOrchestratorService,
    private readonly planAgent: PlanAgentService,
    private readonly tripsService: TripsService,
    private readonly geoService: GeoService,
    private readonly prisma: PrismaService,
  ) {}

  private async createTripFromPlan(dto: PlanItineraryDto, userId: number) {
    const logs: PlanAgentLog[] = [];
    const rawItinerary = await this.planAgent.planItinerary(dto, (log) => {
      logs.push(log);
    });
    const itinerary = sanitizeItinerary(rawItinerary);
    const count = await this.prisma.trip.count({ where: { userId } });
    const createDto = itineraryToCreateTripDto(itinerary, dto, count);
    createDto.dayPlans = await this.geoService.enrichDayPlans(
      createDto.dayPlans ?? [],
      dto.destination,
    );
    createDto.placeCount = countPlaces(createDto.dayPlans ?? []);
    const data = await this.tripsService.create(createDto, userId);
    return { data, logs };
  }

  @Post('plan')
  async plan(@CurrentUser() user: AuthUser, @Body() dto: PlanItineraryDto) {
    const { data, logs } = await this.createTripFromPlan(dto, user.id);
    return { data, logs, message: 'planned' };
  }

  @Post('plan/stream')
  async planStream(
    @CurrentUser() user: AuthUser,
    @Body() dto: PlanItineraryDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const write = (payload: Record<string, unknown>) => {
      res.write(`${JSON.stringify(payload)}\n`);
    };

    try {
      const rawItinerary = await this.planAgent.planItinerary(dto, (log) => {
        write({ type: 'log', kind: log.kind, text: log.text });
      });
      const itinerary = sanitizeItinerary(rawItinerary);

      write({ type: 'status', text: '正在定位地点并保存行程…' });

      const count = await this.prisma.trip.count({ where: { userId: user.id } });
      const createDto = itineraryToCreateTripDto(itinerary, dto, count);
      createDto.dayPlans = await this.geoService.enrichDayPlans(
        createDto.dayPlans ?? [],
        dto.destination,
      );
      createDto.placeCount = countPlaces(createDto.dayPlans ?? []);
      const data = await this.tripsService.create(createDto, user.id);

      write({ type: 'done', data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '行程规划失败';
      write({ type: 'error', message });
    } finally {
      res.end();
    }
  }

  @Post('import')
  async importGuide(
    @CurrentUser() user: AuthUser,
    @Body() dto: ParseGuideDto,
  ) {
    const itinerary = await this.aiOrchestrator.parseGuideText(dto.text);
    const parsed = parseGuideText(dto.text);
    const count = await this.prisma.trip.count({ where: { userId: user.id } });
    const createDto = itineraryToCreateTripDto(
      itinerary,
      {
        destination: parsed.destination,
        days: itinerary.days.length,
        preferences: [],
      },
      count + 1,
    );
    createDto.dayPlans = await this.geoService.enrichDayPlans(
      createDto.dayPlans ?? [],
      parsed.destination,
    );
    createDto.placeCount = countPlaces(createDto.dayPlans ?? []);
    const data = await this.tripsService.create(createDto, user.id);
    return { data, message: 'imported' };
  }

  private async applyRevision(
    tripId: number,
    userId: number,
    message: string,
    onLog?: ReviseLogHandler,
  ) {
    onLog?.('intro', '途绘正在阅读你的修改意见…');
    await sleep(350);

    const trip = await this.tripsService.findOne(tripId, userId);
    const before = tripToItinerarySnapshot({
      title: trip.title,
      days: trip.dayPlans,
    });

    onLog?.('search', '分析当前行程，按你的要求重新规划…');
    await sleep(300);

    const rawItinerary = await this.aiOrchestrator.reviseItinerary(trip, message);

    onLog?.('check', '校验每日景点数量与路线分区…');
    await sleep(250);

    let itinerary = sanitizeItinerary(rawItinerary);
    if (!hasItineraryChanges(before, itinerary)) {
      onLog?.('check', '按你的要求重新编排地点…');
      await sleep(200);
      itinerary = sanitizeItinerary(
        applyDeterministicRevision(before, message, trip.destination),
      );
    }

    const changeSummary = summarizeItineraryChanges(before, itinerary);
    onLog?.('result', changeSummary);

    const updateFields = itineraryToUpdateFields(itinerary);

    onLog?.('location', '更新地图坐标与路线…');
    const dayPlans = await this.geoService.enrichDayPlans(
      updateFields.dayPlans ?? [],
      trip.destination,
    );

    onLog?.('summary', '修改完成，正在刷新行程页…');
    return this.tripsService.update(tripId, userId, {
      ...updateFields,
      dayPlans,
      placeCount: countPlaces(dayPlans),
    });
  }

  @Post('revise')
  async revise(@CurrentUser() user: AuthUser, @Body() dto: ReviseTripDto) {
    const data = await this.applyRevision(dto.tripId, user.id, dto.message);
    return { data, message: 'revised' };
  }

  @Post('revise/stream')
  async reviseStream(
    @CurrentUser() user: AuthUser,
    @Body() dto: ReviseTripDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const write = (payload: Record<string, unknown>) => {
      res.write(`${JSON.stringify(payload)}\n`);
    };

    try {
      const data = await this.applyRevision(
        dto.tripId,
        user.id,
        dto.message,
        (kind, text) => {
          write({ type: 'log', kind, text });
        },
      );

      write({ type: 'done', data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '行程修改失败';
      write({ type: 'error', message });
    } finally {
      res.end();
    }
  }
}
