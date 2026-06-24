import { isRemoteExcursion } from '../geo/geo.utils';
import type { ItineraryOutput } from './schemas/itinerary.schema';

type Poi = ItineraryOutput['days'][number]['pois'][number];

const CITY_URBAN_POIS: Record<string, Array<{ name: string; category: 'sight' | 'food' }>> = {
  北京: [
    { name: '天安门广场', category: 'sight' },
    { name: '景山公园', category: 'sight' },
    { name: '南锣鼓巷', category: 'sight' },
    { name: '什刹海', category: 'sight' },
    { name: '簋街', category: 'food' },
    { name: '颐和园', category: 'sight' },
  ],
  青岛: [
    { name: '栈桥', category: 'sight' },
    { name: '台东步行街', category: 'sight' },
    { name: '青岛啤酒博物馆', category: 'sight' },
    { name: '劈柴院', category: 'food' },
  ],
  成都: [
    { name: '宽窄巷子', category: 'sight' },
    { name: '锦里', category: 'food' },
    { name: '武侯祠', category: 'sight' },
    { name: '春熙路', category: 'sight' },
  ],
  西安: [
    { name: '钟楼', category: 'sight' },
    { name: '回民街', category: 'food' },
    { name: '大雁塔', category: 'sight' },
  ],
  杭州: [
    { name: '西湖', category: 'sight' },
    { name: '河坊街', category: 'food' },
    { name: '灵隐寺', category: 'sight' },
  ],
};

const DEFAULT_URBAN_POIS: Array<{ name: string; category: 'sight' | 'food' }> = [
  { name: '中心广场', category: 'sight' },
  { name: '特色步行街', category: 'sight' },
  { name: '本地美食街', category: 'food' },
];

function poiNames(itinerary: ItineraryOutput): string[] {
  return itinerary.days.flatMap((day) => day.pois.map((poi) => poi.name));
}

function normalizeCity(destination: string): string {
  return destination.replace(/(市|县|区)$/, '').trim();
}

function urbanPool(destination: string): Array<{ name: string; category: 'sight' | 'food' }> {
  const city = normalizeCity(destination);
  const pool = CITY_URBAN_POIS[city];
  if (pool?.length) {
    return pool.map((item) => ({
      name: item.name.includes(city) ? item.name : `${city}${item.name}`,
      category: item.category,
    }));
  }
  return DEFAULT_URBAN_POIS.map((item) => ({
    name: `${city}${item.name}`,
    category: item.category,
  }));
}

function cloneItinerary(itinerary: ItineraryOutput): ItineraryOutput {
  return {
    title: itinerary.title,
    days: itinerary.days.map((day) => ({
      day: day.day,
      title: day.title,
      pois: day.pois.map((poi) => ({ ...poi })),
    })),
  };
}

function usedNames(days: ItineraryOutput['days']): Set<string> {
  return new Set(days.flatMap((day) => day.pois.map((poi) => poi.name)));
}

function pickUnused(
  pool: Array<{ name: string; category: 'sight' | 'food' }>,
  used: Set<string>,
  count: number,
  preferFood = false,
): Poi[] {
  const ordered = preferFood
    ? [...pool].sort((a, b) => Number(b.category === 'food') - Number(a.category === 'food'))
    : pool;
  const picked: Poi[] = [];
  for (const item of ordered) {
    if (picked.length >= count) {
      break;
    }
    if (used.has(item.name)) {
      continue;
    }
    picked.push({ name: item.name, duration: 90, category: item.category });
    used.add(item.name);
  }
  return picked;
}

export function hasItineraryChanges(
  before: ItineraryOutput,
  after: ItineraryOutput,
): boolean {
  const beforeKey = [...poiNames(before)].sort().join('|');
  const afterKey = [...poiNames(after)].sort().join('|');
  return beforeKey !== afterKey;
}

export function summarizeItineraryChanges(
  before: ItineraryOutput,
  after: ItineraryOutput,
): string {
  const beforeNames = new Set(poiNames(before));
  const afterNames = poiNames(after);
  const afterSet = new Set(afterNames);

  const added = afterNames.filter((name) => !beforeNames.has(name));
  const removed = [...beforeNames].filter((name) => !afterSet.has(name));

  const parts: string[] = [];
  if (added.length) {
    parts.push(`新增：${added.slice(0, 4).join('、')}`);
  }
  if (removed.length) {
    parts.push(`移除：${removed.slice(0, 4).join('、')}`);
  }
  if (before.title !== after.title) {
    parts.push('标题已更新');
  }

  return parts.length
    ? parts.join('；')
    : '已按你的意见微调行程（地点与顺序已优化）';
}

export function tripToItinerarySnapshot(trip: {
  title: string;
  days: Array<{
    day: number;
    title?: string;
    places: Array<string | { name: string; category?: string }>;
  }>;
}): ItineraryOutput {
  return {
    title: trip.title,
    days: trip.days.map((day) => ({
      day: day.day,
      title: day.title,
      pois: day.places.map((place) => {
        const name = typeof place === 'string' ? place : place.name;
        const category =
          typeof place === 'string'
            ? ('sight' as const)
            : place.category === 'food'
              ? ('food' as const)
              : ('sight' as const);
        return { name, duration: 90, category };
      }),
    })),
  };
}

/** 当 AI 未产生实质改动时，按关键词确定性重排行程 */
export function applyDeterministicRevision(
  itinerary: ItineraryOutput,
  message: string,
  destination: string,
): ItineraryOutput {
  const foodHint = /美食|逛吃|小吃|餐厅|簋街|胡同/.test(message);
  const fewerHint = /少一点|减少|太多|精简|轻松|2.?3|两.?三/.test(message);
  const remoteHint = /长城|八达岭|远郊|单独|不要和市区|混排/.test(message);
  const dest = normalizeCity(destination);
  const pool = urbanPool(destination);
  const used = usedNames(itinerary.days);
  let days = cloneItinerary(itinerary).days;

  if (remoteHint) {
    const remotePois = days.flatMap((day) =>
      day.pois.filter((poi) => isRemoteExcursion(poi.name)),
    );
    const urbanPois = days.flatMap((day) =>
      day.pois.filter((poi) => !isRemoteExcursion(poi.name)),
    );

    if (remotePois.length) {
      const remoteDayIndex = days.findIndex((day) =>
        day.pois.some((poi) => isRemoteExcursion(poi.name)),
      );
      const remoteDay = remoteDayIndex >= 0 ? remoteDayIndex : days.length - 1;
      const primaryRemote = remotePois[0];

      days = days.map((day, index) => {
        if (index === remoteDay) {
          return {
            ...day,
            title: `DAY ${day.day} ${primaryRemote.name}专线`,
            pois: [{ ...primaryRemote, duration: 360 }],
          };
        }
        return {
          ...day,
          pois: day.pois.filter((poi) => !isRemoteExcursion(poi.name)),
        };
      });

      const urbanOnlyDays = days
        .map((day, index) => ({ day, index }))
        .filter(({ day }) => !day.pois.some((poi) => isRemoteExcursion(poi.name)));

      let urbanQueue = [...urbanPois];
      for (const { day, index } of urbanOnlyDays) {
        while (day.pois.length < 2 && urbanQueue.length) {
          days[index].pois.push(urbanQueue.shift()!);
        }
      }

      for (const { day, index } of urbanOnlyDays) {
        while (day.pois.length < 2) {
          const extra = pickUnused(pool, used, 1);
          if (!extra.length) {
            break;
          }
          days[index].pois.push(...extra);
        }
      }
    }
  }

  if (foodHint) {
    const urbanIndex = days.findIndex(
      (day) => !day.pois.some((poi) => isRemoteExcursion(poi.name)),
    );
    if (urbanIndex >= 0) {
      const foodPoi =
        pickUnused(pool, used, 1, true)[0] ??
        ({ name: `${dest}簋街`, duration: 120, category: 'food' as const });
      const urban = days[urbanIndex];
      const withoutFood = urban.pois.filter((poi) => poi.category !== 'food');
      days[urbanIndex] = {
        ...urban,
        title: `DAY ${urban.day} ${dest}美食体验`,
        pois: [foodPoi, ...withoutFood].slice(0, 3),
      };
    }
  }

  if (fewerHint) {
    days = days.map((day) => ({
      ...day,
      pois: day.pois.slice(0, 2),
      title: day.title?.includes('轻松') ? day.title : `DAY ${day.day} ${dest}轻松游`,
    }));
  }

  const totalPois = days.reduce((sum, day) => sum + day.pois.length, 0);
  if (totalPois <= days.length && (remoteHint || foodHint || fewerHint)) {
    const urbanOnlyDays = days
      .map((day, index) => ({ day, index }))
      .filter(({ day }) => !day.pois.some((poi) => isRemoteExcursion(poi.name)));

    for (const { day, index } of urbanOnlyDays) {
      while (day.pois.length < 2) {
        const extra = pickUnused(pool, used, 1, foodHint);
        if (!extra.length) {
          break;
        }
        days[index].pois.push(...extra);
      }
    }
  }

  return {
    title: itinerary.title,
    days,
  };
}
