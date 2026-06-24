import type { CreateTripDto } from '../trips/dto/create-trip.dto';
import type { ItineraryOutput } from './schemas/itinerary.schema';
import {
  countPlaces,
  formatNights,
  pickCover,
  pickTheme,
} from '../trips/trip-builder';

export function itineraryToCreateTripDto(
  output: ItineraryOutput,
  input: {
    destination: string;
    days: number;
    preferences: string[];
  },
  seed: number,
): CreateTripDto {
  const dayPlans = itineraryToDayPlans(output);

  return {
    destination: input.destination,
    days: input.days,
    preferences: input.preferences,
    title: output.title,
    nights: formatNights(input.days),
    placeCount: countPlaces(dayPlans),
    cover: pickCover(seed),
    theme: pickTheme(seed),
    dayPlans,
  };
}

export function itineraryToDayPlans(output: ItineraryOutput) {
  return output.days.map((day) => ({
    day: day.day,
    title: day.title,
    places: day.pois.map((poi) => ({
      name: poi.name,
      category: poi.category,
      duration: poi.duration,
      tips: poi.tips,
      description: poi.description,
      startTime: poi.startTime,
      endTime: poi.endTime,
    })),
  }));
}

export function itineraryToUpdateFields(output: ItineraryOutput) {
  const dayPlans = itineraryToDayPlans(output);
  return {
    title: output.title,
    dayPlans,
    placeCount: countPlaces(dayPlans),
  };
}
