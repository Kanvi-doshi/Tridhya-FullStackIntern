import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().max(100),
  description: z.string().trim(),
  category: z.string(),
  date: z.string(),
  time: z.string(),
  location: z.string(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});
