import { z } from "zod";

import { InterviewRecommendation } from "../entity/interviewFeedback";

export const createInterviewFeedbackSchema = z.object({
  technicalRating: z.number().int().min(1).max(5),
  communicationRating: z.number().int().min(1).max(5),
  problemSolvingRating: z.number().int().min(1).max(5),
  strengths: z.string().max(2000).optional(),
  weaknesses: z.string().max(2000).optional(),
  comments: z.string().max(3000).optional(),
  recommendation: z.nativeEnum(InterviewRecommendation),
});

export const updateInterviewFeedbackSchema =
  createInterviewFeedbackSchema.partial();
