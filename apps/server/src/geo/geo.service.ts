import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { DayPlan, TripStop } from '../trips/trip.types';
import {
  buildPlaceQueries,
  distanceKm,
  fallbackCoordsNear,
  isCoordNearCluster,
  isCoordPlausible,
  isCoordTooCloseToAny,
  pickClosestPoint,
  poiNameScore,
  type GeoPoint,
} from './geo.utils';

export type { GeoPoint };

interface AmapGeoResponse {
  status: string;
  geocodes?: Array<{ location: string; city?: string }>;
}

interface AmapPoi {
  location: string;
  name: string;
  cityname?: string;
  adname?: string;
}

interface AmapPlaceResponse {
  status: string;
  pois?: AmapPoi[];
}

function placeName(raw: string | TripStop): string {
  return typeof raw === 'string' ? raw : raw.name;
}

function hasCoords(raw: string | TripStop): boolean {
  return typeof raw !== 'string' && raw.lng != null && raw.lat != null;
}

function toStop(raw: string | TripStop, coords?: GeoPoint): TripStop {
  if (typeof raw === 'string') {
    return coords ? { name: raw, ...coords } : { name: raw };
  }
  return coords ? { ...raw, ...coords } : raw;
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

  private async geocodeAddress(
    address: string,
    city?: string,
  ): Promise<GeoPoint | null> {
    if (!this.enabled) {
      return null;
    }

    const cacheKey = `addr:${city ?? ''}:${address}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const url = new URL('https://restapi.amap.com/v3/geocode/geo');
    url.searchParams.set('address', address);
    if (city) {
      url.searchParams.set('city', city);
    }
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
      this.logger.warn(`地址地理编码失败: ${address}`, error);
    }

    return null;
  }

  private pickBestPoi(
    pois: AmapPoi[],
    cityName: string,
    anchor: GeoPoint | null,
    clusterAnchors: GeoPoint[],
    keyword: string,
  ): GeoPoint | null {
    const points = pois.map((poi) => ({
      point: this.parseLocation(poi.location),
      poi,
    }));

    const inCity = points.filter(({ poi }) => {
      const region = `${poi.cityname ?? ''}${poi.adname ?? ''}${poi.name}`;
      return region.includes(cityName);
    });

    const pool = inCity.length ? inCity : points;
    const candidates = pool
      .filter(({ point }) => !isCoordTooCloseToAny(point, clusterAnchors))
      .filter(({ point }) => (anchor ? isCoordPlausible(point, anchor) : true))
      .filter(({ point }) =>
        clusterAnchors.length ? isCoordNearCluster(point, clusterAnchors) : true,
      )
      .map(({ point, poi }) => ({
        point,
        score: poiNameScore(poi.name, keyword),
      }));

    if (!candidates.length) {
      return null;
    }

    candidates.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (!anchor) {
        return 0;
      }
      return distanceKm(anchor, a.point) - distanceKm(anchor, b.point);
    });

    return candidates[0].point;
  }

  async searchPlace(
    keyword: string,
    city: string,
    anchor?: GeoPoint | null,
    clusterAnchors: GeoPoint[] = [],
  ): Promise<GeoPoint | null> {
    const cacheKey = `poi:${city}:${keyword}`;
    const cached = this.cache.get(cacheKey);
    if (
      cached &&
      isCoordPlausible(cached, anchor ?? null) &&
      isCoordNearCluster(cached, clusterAnchors) &&
      !isCoordTooCloseToAny(cached, clusterAnchors)
    ) {
      return cached;
    }

    if (!this.enabled) {
      return null;
    }

    const cityName = city.replace(/(市|县|区)$/, '') || city;

    for (const keywords of buildPlaceQueries(keyword, city)) {
      const url = new URL('https://restapi.amap.com/v3/place/text');
      url.searchParams.set('keywords', keywords);
      url.searchParams.set('city', cityName);
      url.searchParams.set('citylimit', 'true');
      url.searchParams.set('offset', '10');
      url.searchParams.set('page', '1');
      url.searchParams.set('key', this.apiKey);

      try {
        const response = await fetch(url);
        const data = (await response.json()) as AmapPlaceResponse;
        if (data.status === '1' && data.pois?.length) {
          const point = this.pickBestPoi(
            data.pois,
            cityName,
            anchor ?? null,
            clusterAnchors,
            keyword,
          );
          if (point) {
            this.cache.set(cacheKey, point);
            return point;
          }
        }
      } catch (error) {
        this.logger.warn(`地点搜索失败: ${keywords} @ ${cityName}`, error);
      }
    }

    return null;
  }

  async resolveStop(
    name: string,
    destination: string,
    stopIndex: number,
    cityCenter: GeoPoint | null,
    clusterAnchors: GeoPoint[],
  ): Promise<GeoPoint | null> {
    const city = destination.replace(/(市|县|区)$/, '') || destination;
    const anchor = clusterAnchors.length
      ? {
          lng:
            clusterAnchors.reduce((sum, item) => sum + item.lng, 0) /
            clusterAnchors.length,
          lat:
            clusterAnchors.reduce((sum, item) => sum + item.lat, 0) /
            clusterAnchors.length,
        }
      : cityCenter;

    const candidates: GeoPoint[] = [];

    const searched = await this.searchPlace(name, city, anchor, clusterAnchors);
    if (searched) {
      candidates.push(searched);
    }

    for (const query of buildPlaceQueries(name, city).slice(1)) {
      const retry = await this.searchPlace(query, city, anchor, clusterAnchors);
      if (retry) {
        candidates.push(retry);
      }
    }

    const geocoded = await this.geocodeAddress(
      name.includes(city) ? name : `${city}市${name}`,
      city,
    );
    if (geocoded) {
      candidates.push(geocoded);
    }

    let valid = anchor
      ? candidates.filter((point) => isCoordPlausible(point, anchor))
      : candidates;

    valid = valid.filter((point) => !isCoordTooCloseToAny(point, clusterAnchors));

    if (clusterAnchors.length) {
      const clustered = valid.filter((point) =>
        isCoordNearCluster(point, clusterAnchors),
      );
      if (clustered.length) {
        valid = clustered;
      }
    }

    if (anchor && valid.length) {
      return pickClosestPoint(valid, anchor);
    }

    if (valid.length) {
      return valid[0];
    }

    if (!anchor) {
      return null;
    }

    this.logger.warn(`地点坐标回退: ${name} @ ${destination}`);
    let fallback = fallbackCoordsNear(anchor, stopIndex);
    let guard = 0;
    while (isCoordTooCloseToAny(fallback, clusterAnchors) && guard < 6) {
      guard += 1;
      fallback = fallbackCoordsNear(anchor, stopIndex + guard);
    }
    return fallback;
  }

  private async resolveDayPlaces(
    places: Array<string | TripStop>,
    destination: string,
    cityCenter: GeoPoint | null,
  ): Promise<TripStop[]> {
    const resolved: TripStop[] = [];
    const clusterAnchors: GeoPoint[] = [];

    for (let stopIndex = 0; stopIndex < places.length; stopIndex += 1) {
      const raw = places[stopIndex];
      const name = placeName(raw);

      if (hasCoords(raw)) {
        const stop = raw as TripStop;
        const point = { lng: stop.lng!, lat: stop.lat! };
        const anchor = cityCenter ?? (clusterAnchors[0] ?? null);
        if (
          isCoordPlausible(point, anchor) &&
          isCoordNearCluster(point, clusterAnchors) &&
          !isCoordTooCloseToAny(point, clusterAnchors)
        ) {
          resolved.push(stop);
          clusterAnchors.push(point);
          continue;
        }
      }

      const coords = await this.resolveStop(
        name,
        destination,
        stopIndex,
        cityCenter,
        clusterAnchors,
      );

      const stop = toStop(raw, coords ?? undefined);
      resolved.push(stop);
      if (coords) {
        clusterAnchors.push(coords);
      }
    }

    return resolved;
  }

  async enrichDayPlans(
    dayPlans: DayPlan[],
    destination: string,
  ): Promise<DayPlan[]> {
    if (!this.enabled) {
      return dayPlans;
    }

    const cityCenter = await this.geocodeCity(destination);
    const enriched: DayPlan[] = [];

    for (const day of dayPlans) {
      const places = await this.resolveDayPlaces(day.places, destination, cityCenter);
      enriched.push({ ...day, places });
    }

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
    const clusterAnchors: GeoPoint[] = [];
    const results: Array<{ name: string; lng?: number; lat?: number }> = [];

    for (let index = 0; index < names.length; index += 1) {
      const name = names[index];
      const coords = await this.resolveStop(
        name,
        destination,
        index,
        cityCenter,
        clusterAnchors,
      );
      if (coords) {
        clusterAnchors.push(coords);
      }
      results.push(coords ? { name, ...coords } : { name });
    }

    return results;
  }
}
