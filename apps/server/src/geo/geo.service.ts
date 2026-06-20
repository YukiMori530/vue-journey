import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { DayPlan, TripStop } from '../trips/trip.types';

interface GeoPoint {
  lng: number;
  lat: number;
}

export type { GeoPoint };

interface AmapGeoResponse {
  status: string;
  geocodes?: Array<{ location: string }>;
}

interface AmapPlaceResponse {
  status: string;
  pois?: Array<{ location: string; name: string }>;
}

function placeName(raw: string | TripStop): string {
  return typeof raw === 'string' ? raw : raw.name;
}

function hasCoords(raw: string | TripStop): boolean {
  return typeof raw !== 'string' && raw.lng != null && raw.lat != null;
}

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);
  private readonly cache = new Map<string, GeoPoint>();

  constructor(private readonly configService: ConfigService) {}

  get enabled(): boolean {
    return !!this.configService.get<string>('AMAP_WEB_KEY');
  }

  private get apiKey(): string {
    return this.configService.get<string>('AMAP_WEB_KEY') ?? '';
  }

  private async mapPool<T, R>(
    items: T[],
    concurrency: number,
    worker: (item: T, index: number) => Promise<R>,
  ): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let cursor = 0;

    async function runWorker() {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await worker(items[index], index);
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()),
    );
    return results;
  }

  private parseLocation(location: string): GeoPoint {
    const [lng, lat] = location.split(',').map(Number);
    return { lng, lat };
  }

  async geocodeCity(keyword: string): Promise<GeoPoint | null> {
    const cacheKey = `city:${keyword}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.enabled) {
      return null;
    }

    const url = new URL('https://restapi.amap.com/v3/geocode/geo');
    url.searchParams.set('address', keyword);
    url.searchParams.set('key', this.apiKey);

    try {
      const response = await fetch(url);
      const data = (await response.json()) as AmapGeoResponse;
      if (data.status === '1' && data.geocodes?.[0]?.location) {
        const point = this.parseLocation(data.geocodes[0].location);
        this.cache.set(cacheKey, point);
        return point;
      }
    } catch (error) {
      this.logger.warn(`城市地理编码失败: ${keyword}`, error);
    }

    return null;
  }

  async searchPlace(keyword: string, city: string): Promise<GeoPoint | null> {
    const cacheKey = `poi:${city}:${keyword}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.enabled) {
      return null;
    }

    const url = new URL('https://restapi.amap.com/v3/place/text');
    url.searchParams.set('keywords', keyword);
    url.searchParams.set('city', city);
    url.searchParams.set('citylimit', 'true');
    url.searchParams.set('offset', '1');
    url.searchParams.set('page', '1');
    url.searchParams.set('key', this.apiKey);

    try {
      const response = await fetch(url);
      const data = (await response.json()) as AmapPlaceResponse;
      if (data.status === '1' && data.pois?.[0]?.location) {
        const point = this.parseLocation(data.pois[0].location);
        this.cache.set(cacheKey, point);
        return point;
      }
    } catch (error) {
      this.logger.warn(`地点搜索失败: ${keyword} @ ${city}`, error);
    }

    return null;
  }

  private fallbackCoords(
    center: GeoPoint,
    dayIndex: number,
    stopIndex: number,
  ): GeoPoint {
    const angle = dayIndex * 1.2 + stopIndex * 0.9;
    const radius = 0.012 + stopIndex * 0.006;
    return {
      lng: center.lng + Math.cos(angle) * radius,
      lat: center.lat + Math.sin(angle) * radius,
    };
  }

  async resolveStop(
    name: string,
    destination: string,
    dayIndex: number,
    stopIndex: number,
    cityCenter?: GeoPoint | null,
  ): Promise<GeoPoint | null> {
    const city = destination.replace(/(市|县|区)$/, '') || destination;
    const searched = await this.searchPlace(name, city);
    if (searched) {
      return searched;
    }

    const stripped = name.replace(new RegExp(`^${city}`), '').trim() || name;
    if (stripped !== name) {
      const retry = await this.searchPlace(stripped, city);
      if (retry) {
        return retry;
      }
    }

    const center = cityCenter ?? (await this.geocodeCity(destination));
    if (!center) {
      return null;
    }

    return this.fallbackCoords(center, dayIndex, stopIndex);
  }

  async enrichDayPlans(
    dayPlans: DayPlan[],
    destination: string,
  ): Promise<DayPlan[]> {
    if (!this.enabled) {
      return dayPlans;
    }

    const cityCenter = await this.geocodeCity(destination);
    type StopTask = {
      dayIndex: number;
      stopIndex: number;
      raw: string | TripStop;
      name: string;
    };

    const tasks: StopTask[] = [];
    dayPlans.forEach((day, dayIndex) => {
      day.places.forEach((raw, stopIndex) => {
        if (hasCoords(raw)) {
          return;
        }
        tasks.push({
          dayIndex,
          stopIndex,
          raw,
          name: placeName(raw),
        });
      });
    });

    if (!tasks.length) {
      return dayPlans;
    }

    const coordsList = await this.mapPool(tasks, 4, (task) =>
      this.resolveStop(task.name, destination, task.dayIndex, task.stopIndex, cityCenter),
    );

    const enriched = dayPlans.map((day) => ({
      ...day,
      places: [...day.places],
    }));

    tasks.forEach((task, index) => {
      const coords = coordsList[index];
      if (!coords) {
        return;
      }
      const raw = task.raw;
      enriched[task.dayIndex].places[task.stopIndex] =
        typeof raw === 'string' ? { name: raw, ...coords } : { ...raw, ...coords };
    });

    return enriched;
  }

  async batchGeocode(
    destination: string,
    names: string[],
  ): Promise<Array<{ name: string; lng?: number; lat?: number }>> {
    if (!names.length) {
      return [];
    }

    const cityCenter = await this.geocodeCity(destination);
    const coordsList = await this.mapPool(names, 4, (name, index) =>
      this.resolveStop(name, destination, 0, index, cityCenter),
    );

    return names.map((name, index) => {
      const coords = coordsList[index];
      return coords ? { name, ...coords } : { name };
    });
  }
}
