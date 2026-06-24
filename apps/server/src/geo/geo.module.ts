import { Module } from '@nestjs/common';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';
import { PlacePhotoService } from './place-photo.service';

@Module({
  controllers: [GeoController],
  providers: [GeoService, PlacePhotoService],
  exports: [GeoService, PlacePhotoService],
})
export class GeoModule {}
