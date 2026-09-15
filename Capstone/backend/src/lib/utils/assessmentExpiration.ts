import cron from "node-cron";

import { AppDataSource } from "../config/db";

import {
  AssessmentAttempt,
  AssessmentStatus,
} from "../entity/AssessmentAttempt";

import { isAssessmentExpired } from "../utils/assessmentTimer";

import { evaluateAssessment } from "../utils/evaluateAssessment";

const attemptRepository = AppDataSource.getRepository(AssessmentAttempt);

const expireAssessments = async () => {
  try {
    console.log("[Assessment Job] Checking expired assessments...");

    const attempts = await attemptRepository.find({
      where: {
        status: AssessmentStatus.IN_PROGRESS,
      },

      relations: {
        round: true,
      },
    });

    for (const attempt of attempts) {
      if (!isAssessmentExpired(attempt)) {
        continue;
      }

      console.log(`[Assessment Job] Auto submitting attempt: ${attempt.id}`);

      await evaluateAssessment(attempt, true);

      await attemptRepository.save(attempt);

      console.log(`[Assessment Job] Attempt ${attempt.id} auto submitted`);
    }
  } catch (error) {
    console.error(
      "[Assessment Job] Failed to process expired assessments:",
      error,
    );
  }
};

export const startAssessmentExpirationJob = () => {
  cron.schedule("* * * * *", async () => {
    await expireAssessments();
  });

  console.log("Assessment expiration job started");
};
