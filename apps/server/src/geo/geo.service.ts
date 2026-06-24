import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { DayPlan, TripStop } from '../trips/trip.types';
import {
  buildPlaceQueries,
  defaultCityCenter,
  distanceKm,
  extractDestinationRegion,
  inferStopCity,
  isCoordNearCluster,
  isCoordPlausibleForStop,
  isRemoteExcursion,
  isNonAttractionPoi,
  isWideAreaDestination,
  isWithinDestination,
  lookupKnownLandmark,
  MIN_POI_NAME_SCORE,
  normalizeCityName,
  poiNameScore,
  resolveStopGeoContext,
  shouldAddToUrbanCluster,
  shouldBindToCluster,
  type GeoPoint,
} from './geo.utils';
import { orderStopsByZones } from './route-order';
import { trimDayPlanStops } from './day-plan-trim';
import { filterLocatableDayPlans } from './locatable-day-plans';

export type { GeoPoint };

interface AmapGeoResponse {
  status: string;
  geocodes?: Array<{ location: string; city?: string }>;
}

interface AmapPoi {
  id?: string;
  location: string;
  name: string;
  cityname?: string;
  adname?: string;
  photos?: Array<{ url?: string; title?: string }>;
}

interface AmapPlaceDetailResponse {
  status: string;
  pois?: Array<{
    photos?: Array<{ url?: string; title?: string }>;
  }>;
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
    if (isWideAreaDestination(keyword)) {
      return defaultCityCenter(extractDestinationRegion(keyword));
    }

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
    const bindCluster = shouldBindToCluster(keyword);
    const points = pois.map((poi) => ({
      point: this.parseLocation(poi.location),
      poi,
    }));

    const inCity = points.filter(({ poi }) => {
      const region = `${poi.cityname ?? ''}${poi.adname ?? ''}${poi.name}`;
      return region.includes(cityName) || isRemoteExcursion(keyword);
    });

    const pool = inCity.length ? inCity : points;

    const rank = (useCluster: boolean) =>
      pool
        .filter(({ poi }) => !isNonAttractionPoi(poi.name))
        .filter(({ point }) =>
          anchor ? isCoordPlausibleForStop(point, anchor, keyword) : true,
        )
        .filter(({ point }) =>
          bindCluster && useCluster && clusterAnchors.length
            ? isCoordNearCluster(point, clusterAnchors)
            : true,
        )
        .map(({ point, poi }) => ({
          point,
          score: poiNameScore(poi.name, keyword),
        }))
        .filter(({ score }) => score >= MIN_POI_NAME_SCORE);

    let candidates = rank(true);
    if (!candidates.length && bindCluster && clusterAnchors.length) {
      candidates = rank(false);
    }

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

  private readonly photoCache = new Map<string, string | null>();

  /** 从高德 POI 取首张实景图（全国通用，需配置 AMAP_WEB_KEY） */
  async searchPlacePhoto(keyword: string, city: string): Promise<string | null> {
    if (!this.enabled) {
      return null;
    }

    const cacheKey = `photo:${city}:${keyword}`;
    if (this.photoCache.has(cacheKey)) {
      return this.photoCache.get(cacheKey) ?? null;
    }

    const cityName = normalizeCityName(city) || city;

    for (const keywords of buildPlaceQueries(keyword, city)) {
      const url = new URL('https://restapi.amap.com/v3/place/text');
      url.searchParams.set('keywords', keywords);
      url.searchParams.set('city', cityName);
      url.searchParams.set('citylimit', 'true');
      url.searchParams.set('extensions', 'all');
      url.searchParams.set('offset', '5');
      url.searchParams.set('page', '1');
      url.searchParams.set('key', this.apiKey);

      try {
        const response = await fetch(url);
        const data = (await response.json()) as AmapPlaceResponse;
        if (data.status !== '1' || !data.pois?.length) {
          continue;
        }

        for (const poi of data.pois) {
          const direct = poi.photos?.find((item) => item.url)?.url;
          if (direct) {
            this.photoCache.set(cacheKey, direct);
            return direct;
          }

          if (poi.id) {
            const detailUrl = await this.fetchPlaceDetailPhoto(poi.id);
            if (detailUrl) {
              this.photoCache.set(cacheKey, detailUrl);
              return detailUrl;
            }
          }
        }
      } catch (error) {
        this.logger.warn(`POI 图片搜索失败: ${keywords} @ ${cityName}`, error);
      }
    }

    this.photoCache.set(cacheKey, null);
    return null;
  }

  private async fetchPlaceDetailPhoto(poiId: string): Promise<string | null> {
    const url = new URL('https://restapi.amap.com/v3/place/detail');
    url.searchParams.set('id', poiId);
    url.searchParams.set('extensions', 'all');
    url.searchParams.set('key', this.apiKey);

    try {
      const response = await fetch(url);
      const data = (await response.json()) as AmapPlaceDetailResponse;
      const photos = data.pois?.[0]?.photos;
      return photos?.find((item) => item.url)?.url ?? null;
    } catch {
      return null;
    }
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
      isCoordPlausibleForStop(cached, anchor ?? null, keyword) &&
      (shouldBindToCluster(keyword)
        ? isCoordNearCluster(cached, clusterAnchors)
        : true)
    ) {
      return cached;
    }

    if (!this.enabled) {
      return null;
    }

    const cityName = normalizeCityName(city) || city;

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
    urbanClusterAnchors: GeoPoint[],
    clusterCity: string | null,
  ): Promise<GeoPoint | null> {
    const stopCity = inferStopCity(name, destination);
    const { center: stopCenter } = resolveStopGeoContext(
      name,
      destination,
      cityCenter,
    );
    const useCluster =
      clusterCity === stopCity && urbanClusterAnchors.length
        ? urbanClusterAnchors
        : [];

    const known = lookupKnownLandmark(name, destination);
    if (known && isWithinDestination(known, cityCenter, name, destination)) {
      return known;
    }

    const remote = isRemoteExcursion(name);
    const anchor = remote
      ? stopCenter
      : useCluster.length
        ? {
            lng:
              useCluster.reduce((sum, item) => sum + item.lng, 0) /
              useCluster.length,
            lat:
              useCluster.reduce((sum, item) => sum + item.lat, 0) /
              useCluster.length,
          }
        : stopCenter;

    const searched = await this.searchPlace(
      name,
      stopCity,
      anchor,
      useCluster,
    );
    if (
      searched &&
      isWithinDestination(searched, cityCenter, name, destination) &&
      isCoordPlausibleForStop(searched, anchor, name)
    ) {
      return searched;
    }

    return null;
  }

  private async resolveDayPlaces(
    places: Array<string | TripStop>,
    destination: string,
    cityCenter: GeoPoint | null,
  ): Promise<TripStop[]> {
    const resolved: TripStop[] = [];
    const urbanClusterAnchors: GeoPoint[] = [];
    let clusterCity: string | null = null;

    for (let stopIndex = 0; stopIndex < places.length; stopIndex += 1) {
      const raw = places[stopIndex];
      const name = placeName(raw);
      const stopCity = inferStopCity(name, destination);
      if (clusterCity && stopCity !== clusterCity) {
        urbanClusterAnchors.length = 0;
      }
      clusterCity = stopCity;

      if (hasCoords(raw)) {
        const stop = raw as TripStop;
        const point = { lng: stop.lng!, lat: stop.lat! };
        const { center: stopCenter } = resolveStopGeoContext(
          name,
          destination,
          cityCenter,
        );
        const anchor = stopCenter ?? cityCenter ?? urbanClusterAnchors[0] ?? null;
        if (
          isCoordPlausibleForStop(point, anchor, name) &&
          (shouldBindToCluster(name)
            ? !urbanClusterAnchors.length ||
              isCoordNearCluster(point, urbanClusterAnchors)
            : true)
        ) {
          resolved.push(stop);
          if (shouldAddToUrbanCluster(name)) {
            urbanClusterAnchors.push(point);
          }
          continue;
        }
      }

      const coords = await this.resolveStop(
        name,
        destination,
        stopIndex,
        cityCenter,
        urbanClusterAnchors,
        clusterCity,
      );

      const stop = toStop(raw, coords ?? undefined);
      resolved.push(stop);
      if (coords && shouldAddToUrbanCluster(name)) {
        urbanClusterAnchors.push(coords);
      }
    }

    return trimDayPlanStops(
      orderStopsByZones(resolved, cityCenter, destination),
      cityCenter,
    );
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

    const { dayPlans: located, dropped } = filterLocatableDayPlans(
      enriched,
      destination,
    );
    if (dropped.length) {
      this.logger.debug(
        `已移除无法定位的地点: ${dropped.join('、')}`,
      );
    }

    return located;
  }

  async batchGeocode(
    destination: string,
    names: string[],
  ): Promise<Array<{ name: string; lng?: number; lat?: number }>> {
    if (!names.length) {
      return [];
    }

    const cityCenter = await this.geocodeCity(destination);
    const urbanClusterAnchors: GeoPoint[] = [];
    let clusterCity: string | null = null;
    const results: Array<{ name: string; lng?: number; lat?: number }> = [];

    for (let index = 0; index < names.length; index += 1) {
      const name = names[index];
      const stopCity = inferStopCity(name, destination);
      if (clusterCity && stopCity !== clusterCity) {
        urbanClusterAnchors.length = 0;
      }
      clusterCity = stopCity;

      const coords = await this.resolveStop(
        name,
        destination,
        index,
        cityCenter,
        urbanClusterAnchors,
        clusterCity,
      );
      if (coords && shouldAddToUrbanCluster(name)) {
        urbanClusterAnchors.push(coords);
      }
      results.push(coords ? { name, ...coords } : { name });
    }

    return results;
  }
}
