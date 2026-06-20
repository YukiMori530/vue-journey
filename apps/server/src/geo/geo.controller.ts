import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BatchGeocodeDto } from './dto/batch-geocode.dto';
import { GeoService } from './geo.service';

@Controller('geo')
@UseGuards(JwtAuthGuard)
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('status')
  status() {
    return {
      data: { enabled: this.geoService.enabled },
      message: 'ok',
    };
  }

  @Get('city')
  async city(@Query('keyword') keyword: string) {
    const point = await this.geoService.geocodeCity(keyword);
    return { data: point, message: point ? 'ok' : 'not_found' };
  }

  @Post('batch')
  async batch(@Body() dto: BatchGeocodeDto) {
    const data = await this.geoService.batchGeocode(dto.destination, dto.places);
    return { data, message: 'ok' };
  }
}
