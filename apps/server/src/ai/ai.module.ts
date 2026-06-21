import { Module } from '@nestjs/common';
import { GeoModule } from '../geo/geo.module';
import { NotesModule } from '../notes/notes.module';
import { TripsModule } from '../trips/trips.module';
import { AiController } from './ai.controller';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { PlanAgentService } from './plan-agent.service';
import { PlanAgentTools } from './plan-agent.tools';

@Module({
  imports: [TripsModule, GeoModule, NotesModule],
  controllers: [AiController],
  providers: [AiOrchestratorService, PlanAgentService, PlanAgentTools],
})
export class AiModule {}
