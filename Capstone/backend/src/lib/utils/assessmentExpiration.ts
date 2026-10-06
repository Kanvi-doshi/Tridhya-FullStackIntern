import cron from "node-cron";
import { AppDataSource } from "../config/db";
import {
  AssessmentAttempt,
  AssessmentAutoSubmitReason,
  AssessmentStatus,
} from "../entity/AssessmentAttempt";
import { isAssessmentExpired } from "../utils/assessmentTimer";
import { autoSubmitAssessment } from "../utils/assessmentProctoring";
import { getIO } from "../config/socket";

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
        application: true,
      },
    });

    for (const attempt of attempts) {
      if (!isAssessmentExpired(attempt)) {
        continue;
      }
      console.log(`[Assessment Job] Auto submitting attempt: ${attempt.id}`);

      const submitted = await autoSubmitAssessment(
        attempt,
        AssessmentAutoSubmitReason.TIME_EXPIRED,
      );

      if (!submitted) {
        continue;
      }

      getIO().to("hr").emit("assessment:submitted", {
        applicationId: attempt.application.id,
        attemptId: attempt.id,
        roundId: attempt.round.id,
        status: attempt.status,
        score: attempt.score,
        autoSubmitted: true,
        autoSubmitReason: attempt.autoSubmitReason,
        submittedAt: attempt.submittedAt,
      });

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
