import { z } from "zod";
import { JobStatus } from "../entity/Job";

export const createJobSchema = z.object({
  title: z
    .string()
    .min(2, "Job title must contain at least 2 characters")
    .max(150, "Job title cannot exceed 150 characters"),

  description: z
    .string()
    .min(10, "Description must contain at least 10 characters"),

  location: z
    .string()
    .min(2, "Location is required")
    .max(100, "Location cannot exceed 100 characters"),

  experienceRequired: z
    .string()
    .min(1, "Experience requirement is required")
    .max(100, "Experience requirement cannot exceed 100 characters"),

  skills: z.string().optional(),

  status: z.nativeEnum(JobStatus).optional(),
});

export const updateJobSchema = createJobSchema.partial();
