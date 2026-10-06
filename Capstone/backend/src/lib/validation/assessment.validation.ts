import { z } from "zod";

export const saveAnswerSchema = z.object({
  questionId: z.string().uuid("Invalid question ID"),

  answerText: z.string().optional(),
});

export const assessmentViolationSchema = z
  .object({
    type: z.enum(["TAB_SWITCH", "CAMERA_DISABLED"]),
    tabSwitchCount: z.number().int().min(1).max(3).optional(),
  })
  .refine(
    (data) => data.type !== "TAB_SWITCH" || data.tabSwitchCount !== undefined,
    {
      message: "Tab-switch count is required.",
      path: ["tabSwitchCount"],
    },
  );

export const cameraStatusSchema = z.object({
  enabled: z.boolean(),
});
