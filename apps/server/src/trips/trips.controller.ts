import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/auth.types';
import { CreateTripDto } from './dto/create-trip.dto';
import { ImportTripDto } from './dto/import-trip.dto';
import { TripsService } from './trips.service';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    const data = await this.tripsService.findAll(user.id);
    return { data, message: 'ok' };
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateTripDto) {
    const data = await this.tripsService.create(dto, user.id);
    return { data, message: 'created' };
  }

  @Post('import')
  async importFromText(
    @CurrentUser() user: AuthUser,
    @Body() dto: ImportTripDto,
  ) {
    const data = await this.tripsService.importFromText(dto, user.id);
    return { data, message: 'imported' };
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.tripsService.findOne(id, user.id);
    return { data, message: 'ok' };
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.tripsService.remove(id, user.id);
    return { data, message: 'deleted' };
  }
}
