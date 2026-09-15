import { z } from "zod";
import { ApplicationStatus } from "../entity/Application";

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});
