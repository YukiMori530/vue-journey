import { z } from 'zod';

const poiSchema = z.object({
  name: z.string().min(1),
  duration: z.number().int().positive().max(480),
  category: z.enum(['sight', 'food', 'hotel', 'transport']),
  tips: z.string().optional(),
});

const daySchema = z.object({
  day: z.number().int().positive().max(30),
  pois: z.array(poiSchema).min(1).max(5),
});

export const itineraryOutputSchema = z.object({
  title: z.string().min(1).max(100),
  days: z.array(daySchema).min(1).max(30),
});

export type ItineraryOutput = z.infer<typeof itineraryOutputSchema>;

export function validateItinerary(data: unknown): ItineraryOutput {
  return itineraryOutputSchema.parse(data);
}

export function formatZodErrors(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join('；');
}
