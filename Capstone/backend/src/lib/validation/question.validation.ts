import { z } from "zod";

import { QuestionType } from "../entity/Questions";

export const createQuestionSchema = z
  .object({
    type: z.nativeEnum(QuestionType),
    question: z.string().min(2, "Question must contain at least 2 characters"),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    marks: z.number().int().positive("Marks must be greater than 0").optional(),
    starterCode: z.string().optional(),
    testCases: z
      .array(
        z.object({
          input: z.string(),
          expectedOutput: z.string(),
        }),
      )
      .optional(),

    orderNumber: z
      .number()
      .int()
      .positive("Order number must be greater than 0")
      .optional(),
  })

  .superRefine((data, ctx) => {
    if (data.type === QuestionType.CODING) {
            if (!data.testCases || data.testCases.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["testCases"],
          message: "At least one test case is required",
        });
      }
    }
    if (data.type === QuestionType.MCQ) {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message: "MCQ must contain at least 2 options",
        });
      }

      if (!data.correctAnswer) {
        ctx.addIssue({
          code: "custom",
          path: ["correctAnswer"],
          message: "Correct answer is required for MCQ",
        });
      }

      if (
        data.correctAnswer &&
        data.options &&
        !data.options.includes(data.correctAnswer)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["correctAnswer"],
          message: "Correct answer must be one of the provided options",
        });
      }
    }
  });

export const updateQuestionSchema = z.object({
  type: z.nativeEnum(QuestionType).optional(),

  question: z
    .string()
    .min(2, "Question must contain at least 2 characters")
    .optional(),

  options: z.array(z.string()).optional(),

  correctAnswer: z.string().optional(),

  marks: z.number().int().positive().optional(),

  orderNumber: z.number().int().positive().optional(),
  starterCode: z.string().optional(),
  testCases: z
    .array(
      z.object({
        input: z.string(),
        expectedOutput: z.string(),
      }),
    )
    .optional(),
});
