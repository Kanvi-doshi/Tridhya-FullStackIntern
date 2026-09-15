import { AssessmentAttempt } from "../entity/AssessmentAttempt";

export const getAssessmentDeadline = (attempt: AssessmentAttempt) => {
  if (!attempt.startedAt) {
    return null;
  }

  if (!attempt.round.durationMinutes) {
    return null;
  }

  const startedTime = new Date(attempt.startedAt).getTime();

  const durationInMs = attempt.round.durationMinutes * 60 * 1000;

  return new Date(startedTime + durationInMs);
};

export const isAssessmentExpired = (attempt: AssessmentAttempt) => {
  const deadline = getAssessmentDeadline(attempt);

  if (!deadline) {
    return false;
  }

  return new Date().getTime() >= deadline.getTime();
};

export const getRemainingSeconds = (attempt: AssessmentAttempt) => {
  const deadline = getAssessmentDeadline(attempt);

  if (!deadline) {
    return null;
  }

  const remaining = deadline.getTime() - new Date().getTime();

  return Math.max(0, Math.ceil(remaining / 1000));
};
