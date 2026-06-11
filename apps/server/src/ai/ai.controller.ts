import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseGuideText } from '../trips/parse-guide';
import { TripsService } from '../trips/trips.service';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { ParseGuideDto } from './dto/parse-guide.dto';
import { PlanItineraryDto } from './dto/plan-itinerary.dto';
import { itineraryToCreateTripDto } from './itinerary.mapper';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiOrchestrator: AiOrchestratorService,
    private readonly tripsService: TripsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('plan')
  async plan(@Body() dto: PlanItineraryDto) {
    const itinerary = await this.aiOrchestrator.planItinerary(dto);
    const count = await this.prisma.trip.count();
    const createDto = itineraryToCreateTripDto(itinerary, dto, count);
    const data = await this.tripsService.create(createDto);
    return { data, message: 'planned' };
  }

  @Post('import')
  async importGuide(@Body() dto: ParseGuideDto) {
    const itinerary = await this.aiOrchestrator.parseGuideText(dto.text);
    const parsed = parseGuideText(dto.text);
    const count = await this.prisma.trip.count();
    const createDto = itineraryToCreateTripDto(
      itinerary,
      {
        destination: parsed.destination,
        days: itinerary.days.length,
        preferences: [],
      },
      count + 1,
    );
    const data = await this.tripsService.create(createDto);
    return { data, message: 'imported' };
  }
}
