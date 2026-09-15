import { z } from "zod";

export const saveAnswerSchema = z.object({
  questionId: z.string().uuid("Invalid question ID"),
  answerText: z.string().optional(),
});
