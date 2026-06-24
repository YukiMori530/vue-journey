import type { DayPlan, TripStop } from '../trips/trip.types';
import { placeName } from '../trips/trip-builder';
import {
  inferStopCity,
  knownLandmarkStops,
} from './geo.utils';

export function hasLocatedStop(stop: TripStop): boolean {
  return stop.lng != null && stop.lat != null;
}

function asTripStop(raw: string | TripStop): TripStop {
  return typeof raw === 'string' ? { name: raw } : raw;
}

function inferDayCity(
  day: DayPlan,
  destination: string,
): string {
  const context = `${day.title ?? ''} ${destination}`;
  return inferStopCity(context, destination);
}

function pickFallbackStop(
  day: DayPlan,
  dayIndex: number,
  destination: string,
  usedNames: Set<string>,
): TripStop | null {
  const city = inferDayCity(day, destination);
  const landmarks = knownLandmarkStops(city);
  if (!landmarks.length) {
    return null;
  }

  const offset = dayIndex % landmarks.length;
  for (let index = 0; index < landmarks.length; index += 1) {
    const landmark = landmarks[(offset + index) % landmarks.length];
    const fullName = landmark.name.includes(city)
      ? landmark.name
      : `${city}${landmark.name}`;
    if (usedNames.has(fullName) || usedNames.has(landmark.name)) {
      continue;
    }
    return {
      name: fullName,
      lng: landmark.lng,
      lat: landmark.lat,
      category: 'sight',
    };
  }

  return null;
}

/** 只保留已 geocode 成功的站点，确保地图可画 marker 与路线 */
export function filterLocatableDayPlans(
  dayPlans: DayPlan[],
  destination: string,
): { dayPlans: DayPlan[]; dropped: string[] } {
  const dropped: string[] = [];
  const usedNames = new Set<string>();

  const result = dayPlans.map((day, dayIndex) => {
    let places = day.places.filter((raw) => {
      const stop = asTripStop(raw);
      if (hasLocatedStop(stop)) {
        usedNames.add(placeName(stop));
        return true;
      }
      dropped.push(placeName(stop));
      return false;
    }) as TripStop[];

    if (!places.length) {
      const fallback = pickFallbackStop(day, dayIndex, destination, usedNames);
      if (fallback) {
        places = [fallback];
        usedNames.add(fallback.name);
      }
    }

    return { ...day, places };
  });

  return { dayPlans: result, dropped };
}
