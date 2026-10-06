import { z } from "zod";
import { InterviewAssignmentStatus } from "../entity/interviewAssignment";

export const createInterviewAssignmentSchema = z
  .object({
    interviewerId: z.string().uuid("Invalid interviewer ID"),
    scheduledAt: z.string().datetime("Invalid start date and time"),
    endsAt: z.string().datetime("Invalid end date and time"),
    location: z.string().trim().min(2).max(255),
  })
  .refine((data) => Date.parse(data.endsAt) > Date.parse(data.scheduledAt), {
    message: "End time must be after start time",
    path: ["endsAt"],
  });

export const updateInterviewAssignmentSchema = z.object({
  interviewerId: z.string().uuid().optional(),
  scheduledAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  location: z.string().trim().min(2).max(255).optional(),
  status: z.nativeEnum(InterviewAssignmentStatus).optional(),
});
