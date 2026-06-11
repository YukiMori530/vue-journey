import type { DayPlan } from './trip.types';

const THEMES = [
  'linear-gradient(135deg, #d4ede8 0%, #c5e8e0 100%)',
  'linear-gradient(135deg, #fdebd3 0%, #f9dcc4 100%)',
  'linear-gradient(135deg, #e8eef9 0%, #d6e4ff 100%)',
  'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
];

const COVERS = [
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&q=80',
  'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&q=80',
  'https://images.unsplash.com/photo-1508804185872-d83badad00f2?w=400&q=80',
  'https://images.unsplash.com/photo-1547981609-4c6a41de1593?w=400&q=80',
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
    const places = Array.from({ length: count }, (_, placeIndex) => {
      const template =
        PLACE_TEMPLATES[(day + placeIndex) % PLACE_TEMPLATES.length];
      return `${destination}${template}`;
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

export function pickCover(seed: number) {
  return COVERS[seed % COVERS.length];
}

export function pickTheme(seed: number) {
  return THEMES[seed % THEMES.length];
}

export function formatNights(days: number) {
  return `${days}天${Math.max(days - 1, 0)}晚`;
}
