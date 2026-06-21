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
import { itineraryToCreateTripDto } from './itinerary.mapper';
import { PlanAgentService } from './plan-agent.service';
import type { PlanAgentLog } from './plan-agent.types';

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
    const itinerary = await this.planAgent.planItinerary(dto, (log) => {
      logs.push(log);
    });
    const count = await this.prisma.trip.count({ where: { userId } });
    const createDto = itineraryToCreateTripDto(itinerary, dto, count);
    createDto.dayPlans = await this.geoService.enrichDayPlans(
      createDto.dayPlans ?? [],
      dto.destination,
    );
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
      const itinerary = await this.planAgent.planItinerary(dto, (log) => {
        write({ type: 'log', kind: log.kind, text: log.text });
      });

      write({ type: 'status', text: '正在定位地点并保存行程…' });

      const count = await this.prisma.trip.count({ where: { userId: user.id } });
      const createDto = itineraryToCreateTripDto(itinerary, dto, count);
      createDto.dayPlans = await this.geoService.enrichDayPlans(
        createDto.dayPlans ?? [],
        dto.destination,
      );
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
    const data = await this.tripsService.create(createDto, user.id);
    return { data, message: 'imported' };
  }
}
