import { Injectable, Logger } from '@nestjs/common';
import { GeoService } from './geo.service';

const LOCAL_POI_PHOTOS: Array<{ keywords: string[]; path: string }> = [
  { keywords: ['天安门'], path: '/covers/pois/tiananmen.jpg' },
  { keywords: ['故宫', '紫禁城'], path: '/covers/pois/gugong.jpg' },
  { keywords: ['前门', '大栅栏'], path: '/covers/pois/qianmen.jpg' },
  { keywords: ['颐和园'], path: '/covers/pois/yiheyuan.jpg' },
  { keywords: ['圆明园'], path: '/covers/pois/yuanmingyuan.jpg' },
  { keywords: ['八达岭', '慕田峪', '长城'], path: '/covers/pois/badaling.jpg' },
  { keywords: ['天坛', '景山', '什刹海', '南锣鼓巷', '簋街', '护国寺'], path: '/covers/pois/qianmen.jpg' },
];

const DESTINATION_PHOTOS: Record<string, string> = {
  北京: '/covers/pois/tiananmen.jpg',
  上海: '/covers/pois/gugong.jpg',
  成都: '/covers/pois/qianmen.jpg',
  杭州: '/covers/pois/yiheyuan.jpg',
  西安: '/covers/pois/badaling.jpg',
  青岛: '/covers/pois/yiheyuan.jpg',
  海南: '/covers/hainan.jpg',
  三亚: '/covers/hainan.jpg',
  海口: '/covers/hainan.jpg',
};

const FOOD_PHOTO = '/covers/pois/qianmen.jpg';
const FOOD_HINT_RE = /小吃|美食|餐厅|美食街|小吃街|步行街|夜市|胡同|簋街|王府井|田子坊|回民街|宽窄巷子|锦里|劈柴院|台东|八大局/;

function primaryPlaceName(name: string): string {
  return name
    .split(/[/|、·]/)[0]
    .replace(/[（(].*?[）)]/g, '')
    .trim();
}

function normalizeCity(destination: string): string {
  return destination.replace(/(市|县|区|省)$/, '').trim();
}

function matchesKeyword(name: string, keyword: string): boolean {
  const primary = primaryPlaceName(name);
  return primary.includes(keyword) || keyword.includes(primary);
}

function lookupLocalPoiPhoto(name: string): string | null {
  const primary = primaryPlaceName(name);
  for (const item of LOCAL_POI_PHOTOS) {
    if (item.keywords.some((keyword) => matchesKeyword(primary, keyword))) {
      return item.path;
    }
  }
  return null;
}

function lookupDestinationPhoto(destination: string): string | null {
  const city = normalizeCity(destination);
  return DESTINATION_PHOTOS[city] ?? null;
}

function lookupCategoryPhoto(name: string, category?: string): string | null {
  if (category === 'food' || category === '美食') {
    return FOOD_PHOTO;
  }
  if (FOOD_HINT_RE.test(primaryPlaceName(name))) {
    return FOOD_PHOTO;
  }
  return null;
}

@Injectable()
export class PlacePhotoService {
  private readonly logger = new Logger(PlacePhotoService.name);
  private readonly cache = new Map<string, string | null>();

  constructor(private readonly geoService: GeoService) {}

  async resolvePhoto(
    name: string,
    destination: string,
    category?: string,
  ): Promise<string | null> {
    const key = `${destination}::${name}::${category ?? ''}`;
    if (this.cache.has(key)) {
      return this.cache.get(key) ?? null;
    }

    const local = lookupLocalPoiPhoto(name);
    if (local) {
      this.cache.set(key, local);
      return local;
    }

    const amapPhoto = await this.geoService.searchPlacePhoto(name, destination);
    if (amapPhoto) {
      this.cache.set(key, amapPhoto);
      return amapPhoto;
    }

    const categoryPhoto = lookupCategoryPhoto(name, category);
    if (categoryPhoto) {
      this.cache.set(key, categoryPhoto);
      return categoryPhoto;
    }

    const destinationPhoto = lookupDestinationPhoto(destination);
    if (destinationPhoto) {
      this.cache.set(key, destinationPhoto);
      return destinationPhoto;
    }

    this.logger.debug(`未找到景点图：${name}（${destination}）`);
    this.cache.set(key, null);
    return null;
  }
}
