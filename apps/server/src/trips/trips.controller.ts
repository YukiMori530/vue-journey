import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { ImportTripDto } from './dto/import-trip.dto';
import { TripsService } from './trips.service';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  async findAll() {
    const data = await this.tripsService.findAll();
    return { data, message: 'ok' };
  }

  @Post()
  async create(@Body() dto: CreateTripDto) {
    const data = await this.tripsService.create(dto);
    return { data, message: 'created' };
  }

  @Post('import')
  async importFromText(@Body() dto: ImportTripDto) {
    const data = await this.tripsService.importFromText(dto);
    return { data, message: 'imported' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.tripsService.findOne(id);
    return { data, message: 'ok' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.tripsService.remove(id);
    return { data, message: 'deleted' };
  }
}
