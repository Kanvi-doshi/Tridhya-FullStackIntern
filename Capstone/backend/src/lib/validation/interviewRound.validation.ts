import { z } from "zod";

import { RoundType } from "../entity/InterviewRound";

export const createInterviewRoundSchema = z.object({
  roundNumber: z.number().int().min(1, "Round number must be at least 1"),

  title: z
    .string()
    .min(2, "Round title must contain at least 2 characters")
    .max(150, "Round title cannot exceed 150 characters"),

  type: z.nativeEnum(RoundType),

  description: z.string().optional(),

  durationMinutes: z
    .number()
    .int()
    .positive("Duration must be greater than 0")
    .optional(),

  passingScore: z
    .number()
    .min(0, "Passing score cannot be less than 0")
    .max(100, "Passing score cannot exceed 100")
    .optional(),

  isActive: z.boolean().optional(),
});

export const updateInterviewRoundSchema = createInterviewRoundSchema.partial();
