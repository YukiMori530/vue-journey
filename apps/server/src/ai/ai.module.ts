import { Module } from '@nestjs/common';
import { TripsModule } from '../trips/trips.module';
import { AiController } from './ai.controller';
import { AiOrchestratorService } from './ai-orchestrator.service';

@Module({
  imports: [TripsModule],
  controllers: [AiController],
  providers: [AiOrchestratorService],
})
export class AiModule {}
