import {
  isRemoteExcursion,
  primaryPlaceName,
} from '../geo/geo.utils';
import type { ItineraryOutput } from './schemas/itinerary.schema';

export const MAX_POIS_PER_DAY = 3;

type Poi = ItineraryOutput['days'][number]['pois'][number];

function poiNameKey(name: string): string {
  const primary = primaryPlaceName(name).replace(/\s/g, '');
  if (/颐和园/.test(primary)) {
    return '颐和园';
  }
  if (/圆明园/.test(primary)) {
    return '圆明园';
  }
  if (/故宫/.test(primary)) {
    return '故宫';
  }
  return primary;
}

function dedupePois(pois: Poi[]): Poi[] {
  const seen = new Set<string>();
  const result: Poi[] = [];
  for (const poi of pois) {
    const key = poiNameKey(poi.name);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(poi);
  }
  return result;
}

/** 远郊与市区混排时，远郊单独占一天（剔除同 day 的市区点，稍后分配到其他天） */
function splitRemoteUrban(pois: Poi[]): { kept: Poi[]; overflow: Poi[] } {
  const remote = pois.filter((poi) => isRemoteExcursion(poi.name));
  const urban = pois.filter((poi) => !isRemoteExcursion(poi.name));

  if (!remote.length || !urban.length) {
    return { kept: pois, overflow: [] };
  }

  return { kept: remote, overflow: urban };
}

function redistributeOverflow(
  days: ItineraryOutput['days'],
  overflow: Poi[],
): ItineraryOutput['days'] {
  if (!overflow.length) {
    return days;
  }

  const result = days.map((day) => ({ ...day, pois: [...day.pois] }));

  for (const poi of overflow) {
    const urbanDays = result.filter(
      (day) => !day.pois.some((item) => isRemoteExcursion(item.name)),
    );
    urbanDays.sort((a, b) => a.pois.length - b.pois.length);

    let target = result.find(
      (day) =>
        day.pois.length < MAX_POIS_PER_DAY &&
        !day.pois.some((item) => isRemoteExcursion(item.name)),
    );

    if (!target && urbanDays.length) {
      target = urbanDays[0];
      if (target.pois.length >= MAX_POIS_PER_DAY) {
        target.pois = target.pois.slice(0, MAX_POIS_PER_DAY - 1);
      }
    }

    if (target) {
      target.pois.push(poi);
    }
  }

  return result;
}

/** 控制每日强度：去重、远郊分日、每日最多 3 个 POI */
export function sanitizeItinerary(itinerary: ItineraryOutput): ItineraryOutput {
  let overflow: Poi[] = [];

  const days = itinerary.days.map((day) => {
    let pois = dedupePois(day.pois);
    const split = splitRemoteUrban(pois);
    pois = split.kept;
    overflow = overflow.concat(split.overflow);

    if (pois.length > MAX_POIS_PER_DAY) {
      overflow = overflow.concat(pois.slice(MAX_POIS_PER_DAY));
      pois = pois.slice(0, MAX_POIS_PER_DAY);
    }

    return { ...day, pois };
  });

  const redistributed = redistributeOverflow(days, overflow);

  return {
    ...itinerary,
    days: redistributed.map((day) => ({
      ...day,
      pois: dedupePois(day.pois).slice(0, MAX_POIS_PER_DAY),
    })),
  };
}
