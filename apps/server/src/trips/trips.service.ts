import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type Trip } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { ImportTripDto } from './dto/import-trip.dto';
import { parseGuideText } from './parse-guide';
import {
  buildTitle,
  countPlaces,
  formatNights,
  mockDayPlans,
  pickCover,
  pickTheme,
} from './trip-builder';
import type { DayPlan, TripResponse } from './trip.types';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TripResponse[]> {
    const trips = await this.prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return trips.map((trip) => this.toResponse(trip));
  }

  async findOne(id: number): Promise<TripResponse> {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      throw new NotFoundException(`行程 ${id} 不存在`);
    }
    return this.toResponse(trip);
  }

  async create(dto: CreateTripDto): Promise<TripResponse> {
    const dayPlans = dto.dayPlans ?? mockDayPlans(dto.destination, dto.days);
    const count = await this.prisma.trip.count();

    const trip = await this.prisma.trip.create({
      data: {
        destination: dto.destination,
        days: dto.days,
        preferences: dto.preferences,
        title:
          dto.title ?? buildTitle(dto.destination, dto.days, dto.preferences),
        nights: dto.nights ?? formatNights(dto.days),
        placeCount: dto.placeCount ?? countPlaces(dayPlans),
        cover: dto.cover ?? pickCover(count),
        theme: dto.theme ?? pickTheme(count),
        dayPlans: dayPlans as unknown as Prisma.InputJsonValue,
      },
    });

    return this.toResponse(trip);
  }

  async importFromText(dto: ImportTripDto): Promise<TripResponse> {
    const parsed = parseGuideText(dto.text);
    const count = await this.prisma.trip.count();

    const trip = await this.prisma.trip.create({
      data: {
        destination: parsed.destination,
        days: parsed.days,
        preferences: [],
        title: `${parsed.destination}${parsed.days}日导入行程`,
        nights: formatNights(parsed.days),
        placeCount: countPlaces(parsed.dayPlans),
        cover: pickCover(count + 1),
        theme: pickTheme(count + 1),
        dayPlans: parsed.dayPlans as unknown as Prisma.InputJsonValue,
      },
    });

    return this.toResponse(trip);
  }

  async remove(id: number): Promise<TripResponse> {
    const existing = await this.prisma.trip.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`行程 ${id} 不存在`);
    }

    const trip = await this.prisma.trip.delete({ where: { id } });
    return this.toResponse(trip);
  }

  private toResponse(trip: Trip): TripResponse {
    return {
      id: trip.id,
      destination: trip.destination,
      days: trip.days,
      preferences: trip.preferences as string[],
      title: trip.title,
      nights: trip.nights,
      placeCount: trip.placeCount,
      cover: trip.cover,
      theme: trip.theme,
      dayPlans: trip.dayPlans as unknown as DayPlan[],
    };
  }
}
