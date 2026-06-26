import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BatchGeocodeDto } from './dto/batch-geocode.dto';
import { GeoService } from './geo.service';
import { PlacePhotoService } from './place-photo.service';

@Controller('geo')
@UseGuards(JwtAuthGuard)
export class GeoController {
  constructor(
    private readonly geoService: GeoService,
    private readonly placePhotoService: PlacePhotoService,
  ) {}

  @Public()
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

  @Public()
  @Get('place')
  async place(
    @Query('name') name: string,
    @Query('destination') destination: string,
  ) {
    const point = await this.geoService.geocodePlace(
      name?.trim() ?? '',
      destination?.trim() ?? '',
    );
    return { data: point, message: point ? 'ok' : 'not_found' };
  }

  @Public()
  @Post('batch')
  async batch(@Body() dto: BatchGeocodeDto) {
    const data = await this.geoService.batchGeocode(dto.destination, dto.places);
    return { data, message: 'ok' };
  }

  @Public()
  @Get('place-photo')
  async placePhoto(
    @Query('name') name: string,
    @Query('destination') destination: string,
    @Query('category') category?: string,
  ) {
    const url = await this.placePhotoService.resolvePhoto(
      name?.trim() ?? '',
      destination?.trim() ?? '',
      category?.trim(),
    );
    return { data: { url }, message: url ? 'ok' : 'not_found' };
  }
}
