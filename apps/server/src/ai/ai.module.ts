import { Module } from '@nestjs/common';
import { GeoModule } from '../geo/geo.module';
import { TripsModule } from '../trips/trips.module';
import { AiController } from './ai.controller';
import { AiOrchestratorService } from './ai-orchestrator.service';

@Module({
  imports: [TripsModule, GeoModule],
  controllers: [AiController],
  providers: [AiOrchestratorService],
})
export class AiModule {}
