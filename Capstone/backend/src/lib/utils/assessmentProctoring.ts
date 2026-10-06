import { AppDataSource } from "../config/db";

import {
  AssessmentAttempt,
  AssessmentAutoSubmitReason,
  AssessmentStatus,
} from "../entity/AssessmentAttempt";
import { updateApplicationRound } from "./updateApplicationRound";
import { evaluateAssessment } from "./evaluateAssessment";

const attemptRepository = AppDataSource.getRepository(AssessmentAttempt);

export const autoSubmitAssessment = async (
  attempt: AssessmentAttempt,
  reason: AssessmentAutoSubmitReason,
) => {
  if (attempt.status !== AssessmentStatus.IN_PROGRESS) {
    return false;
  }

  await evaluateAssessment(attempt, true);
  
  attempt.autoSubmitted = true;
  attempt.autoSubmitReason = reason;

  await attemptRepository.save(attempt);
  await updateApplicationRound(attempt);

  return true;
};
