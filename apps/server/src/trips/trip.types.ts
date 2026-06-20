export interface TripStop {
  name: string;
  lng?: number;
  lat?: number;
  category?: string;
  duration?: number;
  tips?: string;
}

export interface DayPlan {
  day: number;
  places: Array<string | TripStop>;
}

export interface TripResponse {
  id: number;
  destination: string;
  days: number;
  preferences: string[];
  title: string;
  nights: string;
  placeCount: number;
  cover: string;
  theme: string;
  dayPlans: DayPlan[];
}
