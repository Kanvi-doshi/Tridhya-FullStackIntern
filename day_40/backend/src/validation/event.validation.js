import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(5).max(100),
  description: z.string().trim().min(10),
  category: z.string(),
  date: z.string(),
  time: z.string(),
  location: z.string(),
  image: z.string().optional(),
  capacity: z.number().min(1),
});
