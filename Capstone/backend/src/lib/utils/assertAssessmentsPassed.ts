import type { EntityManager } from "typeorm";
import { AppDataSource } from "../config/db";
import {
  AssessmentAttempt,
  AssessmentStatus,
} from "../entity/AssessmentAttempt";
import { InterviewRound, RoundType } from "../entity/InterviewRound";
import { AppError } from "../middleware/error.middleware";

export async function assertAssessmentsPassed(
  applicationId: string,
  jobId: string,
  manager: EntityManager = AppDataSource.manager,
 ) {
  const rounds = await manager.getRepository(InterviewRound).find({
    where: {
      job: { id: jobId },
      isActive: true,
    },
    order: { roundNumber: "ASC" },
  });

  const assessments = rounds.filter(
    (round) => round.type !== RoundType.INTERVIEW,
  );

  if (assessments.length !== 3) {
    throw new AppError(
      "Configure exactly three active assessment rounds before interview approval.",
      400,
    );
  }

  const attempts = await manager.getRepository(AssessmentAttempt).find({
    where: { application: { id: applicationId } },
    relations: { round: true },
    order: { createdAt: "DESC" },
  });

  for (const round of assessments) {
    // Use the newest attempt if historical duplicates exist.
    const attempt = attempts.find((item) => item.round.id === round.id);

    if (attempt?.status !== AssessmentStatus.PASSED) {
      throw new AppError(
        `The candidate must pass Round ${round.roundNumber}: ${round.title} before interview approval.`,
        400,
      );
    }
  }
}
