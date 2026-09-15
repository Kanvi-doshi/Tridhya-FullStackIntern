import { z } from "zod";

import { InterviewAssignmentStatus } from "../entity/interviewAssignment";

export const createInterviewAssignmentSchema = z.object({
  interviewerId: z.string().uuid("Invalid interviewer ID"),

  scheduledAt: z
    .string()
    .datetime("Please provide a valid scheduled date and time"),

  location: z
    .string()
    .min(2, "Interview location is required")
    .max(255, "Location cannot exceed 255 characters"),
});

export const updateInterviewAssignmentSchema = z.object({
  interviewerId: z.string().uuid("Invalid interviewer ID").optional(),

  scheduledAt: z
    .string()
    .datetime("Please provide a valid scheduled date and time")
    .optional(),

  location: z.string().min(2).max(255).optional(),

  status: z.nativeEnum(InterviewAssignmentStatus).optional(),
});
