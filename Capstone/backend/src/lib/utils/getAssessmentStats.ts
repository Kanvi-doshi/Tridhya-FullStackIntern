import { In } from "typeorm";
import { AppDataSource } from "../config/db";
import {
  AssessmentAttempt,
  AssessmentStatus,
} from "../entity/AssessmentAttempt";

interface ApplicationSummary {
  id: string;
  currentRound: number;
}

export async function getAssessmentStats(applications: ApplicationSummary[]) {
  const stats = new Map<
    string,
    {
      currentRound: number;
      assessmentScore: number | null;
    }
  >();

  if (applications.length === 0) return stats;
  const attempts = await AppDataSource.getRepository(AssessmentAttempt).find({
    where: {
      application: {
        id: In(applications.map((application) => application.id)),
      },
    },
    relations: {
      application: true,
      round: true,
    },
    order: { createdAt: "DESC" },
  });

  // Use the latest attempt for each round.
  const grouped = new Map<string, Map<string, AssessmentAttempt>>();
  for (const attempt of attempts) {
    const applicationId = attempt.application.id;
    let rounds = grouped.get(applicationId);

    if (!rounds) {
      rounds = new Map();
      grouped.set(applicationId, rounds);
    }

    if (!rounds.has(attempt.round.id)) {
      rounds.set(attempt.round.id, attempt);
    }
  }

  for (const application of applications) {
    const applicationAttempts = [
      ...(grouped.get(application.id)?.values() ?? []),
    ];
    const completed = applicationAttempts.filter(
      (attempt) =>
        (attempt.status === AssessmentStatus.PASSED ||
          attempt.status === AssessmentStatus.FAILED) &&
        attempt.score !== null,
    );
    const assessmentScore =
      completed.length > 0
        ? Number(
            (
              completed.reduce(
                (total, attempt) => total + Number(attempt.score),
                0,
              ) / completed.length
            ).toFixed(2),
          )
        : null;
    const highestAttemptedRound = applicationAttempts.reduce(
      (highest, attempt) => Math.max(highest, attempt.round.roundNumber),
      0,
    );

    stats.set(application.id, {
      // Preserve existing progression; recover old "Not Started" values.
      currentRound:
        application.currentRound > 0
          ? application.currentRound
          : highestAttemptedRound,
      assessmentScore,
    });
  }
  return stats;
}
