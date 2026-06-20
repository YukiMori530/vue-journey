import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseGuideText } from '../trips/parse-guide';
import { TripsService } from '../trips/trips.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/auth.types';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { GeoService } from '../geo/geo.service';
import { NotesService } from '../notes/notes.service';
import { ParseGuideDto } from './dto/parse-guide.dto';
import { PlanItineraryDto } from './dto/plan-itinerary.dto';
import { itineraryToCreateTripDto } from './itinerary.mapper';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiOrchestrator: AiOrchestratorService,
    private readonly tripsService: TripsService,
    private readonly geoService: GeoService,
    private readonly notesService: NotesService,
    private readonly prisma: PrismaService,
  ) {}

  private buildNoteContext(destination: string, preferences: string[], rawQuery?: string) {
    const query = [destination, ...preferences, rawQuery ?? ''].filter(Boolean).join(' ');
    const notes = this.notesService.search(query).slice(0, 3);
    if (!notes.length) {
      const fallback = this.notesService.search(destination).slice(0, 2);
      return fallback
        .map((note) => `【${note.title}】\n${note.content}`)
        .join('\n\n');
    }
    return notes.map((note) => `【${note.title}】\n${note.content}`).join('\n\n');
  }

  @Post('plan')
  async plan(@CurrentUser() user: AuthUser, @Body() dto: PlanItineraryDto) {
    const noteContext = this.buildNoteContext(
      dto.destination,
      dto.preferences,
      dto.rawQuery,
    );
    const itinerary = await this.aiOrchestrator.planItinerary(dto, noteContext);
    const count = await this.prisma.trip.count({ where: { userId: user.id } });
    const createDto = itineraryToCreateTripDto(itinerary, dto, count);
    createDto.dayPlans = await this.geoService.enrichDayPlans(
      createDto.dayPlans ?? [],
      dto.destination,
    );
    const data = await this.tripsService.create(createDto, user.id);
    return { data, message: 'planned' };
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
