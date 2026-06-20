import type { DayPlan, TripStop } from './trip.types';

const THEMES = [
  '#E6E0F3',
  '#D1E9E2',
  '#FFF0C9',
  '#DCE8F7',
  '#FCE4EC',
  '#E8F5E9',
];

/** 本地封面路径（由 H5 public/covers 提供，不依赖外网） */
const COVERS = [
  '/covers/yantai.jpg',
  '/covers/chengdu.jpg',
  '/covers/hainan.jpg',
  '/covers/default.jpg',
];

const PLACE_TEMPLATES = [
  '中心广场',
  '特色步行街',
  '本地美食街',
  '城市公园',
  '博物馆',
  '网红咖啡店',
  '观景平台',
  '古街片区',
];

export function mockDayPlans(destination: string, days: number): DayPlan[] {
  return Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const count = 2 + (day % 3);
    const places: TripStop[] = Array.from({ length: count }, (_, placeIndex) => {
      const template =
        PLACE_TEMPLATES[(day + placeIndex) % PLACE_TEMPLATES.length];
      return { name: `${destination}${template}`, category: 'sight' };
    });
    return { day, places };
  });
}

export function buildTitle(
  destination: string,
  days: number,
  preferences: string[],
) {
  const pref = preferences[0];
  if (pref) {
    return `${destination}${days}日${pref}之旅`;
  }
  return `${destination}${days}日游`;
}

export function countPlaces(dayPlans: DayPlan[]) {
  return dayPlans.reduce((sum, day) => sum + day.places.length, 0);
}

export function placeName(place: string | TripStop): string {
  return typeof place === 'string' ? place : place.name;
}

export function pickCover(seed: number) {
  return COVERS[seed % COVERS.length];
}

export function pickTheme(seed: number) {
  return THEMES[seed % THEMES.length];
}

export function formatNights(days: number) {
  if (days <= 0) {
    return '未设置日期';
  }
  return `${days}天${Math.max(days - 1, 0)}晚`;
}
