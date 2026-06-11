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
  const dayPlans = output.days.map((day) => ({
    day: day.day,
    places: day.pois.map((poi) => poi.name),
  }));

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
