import { Not } from "typeorm";
import { AppDataSource } from "../config/db";
import { getIO } from "../config/socket";
import { Application, ApplicationStatus } from "../entity/Application";
import {
  AssessmentAttempt,
  AssessmentAutoSubmitReason,
  AssessmentStatus,
} from "../entity/AssessmentAttempt";
import { InterviewRound, RoundType } from "../entity/InterviewRound";
import { UserRole } from "../entity/User";
import { notifyUsers } from "../services/notification.service";

export const updateApplicationRound = async (attempt: AssessmentAttempt) => {
  const applicationRepository = AppDataSource.getRepository(Application);
  const application = await applicationRepository.findOne({
    where: { id: attempt.application.id },
    relations: { job: true, candidate: true },
  });
  if (!application) return;

  const integrityViolation =
    attempt.autoSubmitted &&
    attempt.autoSubmitReason !== null &&
    attempt.autoSubmitReason !== AssessmentAutoSubmitReason.TIME_EXPIRED;

  if (attempt.status === AssessmentStatus.FAILED || integrityViolation) {
    application.status = ApplicationStatus.REJECTED;
    application.currentRound = attempt.round.roundNumber;
    await applicationRepository.save(application);

    const reason = integrityViolation
      ? "A tab-switch or camera violation caused the assessment to be auto-submitted. The application has been rejected."
      : `You did not pass Round ${attempt.round.roundNumber}. The application has been rejected.`;

    void notifyUsers(
      { userIds: [application.candidate.id] },
      {
        eventKey: `application:${application.id}:round:${attempt.round.id}:rejected`,
        title: "Application rejected",
        message: reason,
        link: `/application/${application.id}`,
      },
      true,
    ).catch((error) =>
      console.error("Assessment rejection notification failed.", error),
    );
  } else if (attempt.status === AssessmentStatus.PASSED) {
    const rounds = await AppDataSource.getRepository(InterviewRound).find({
      where: { job: { id: application.job.id }, isActive: true },
      order: { roundNumber: "ASC" },
    });

    const nextRound = rounds.find(
      (round) => round.roundNumber > attempt.round.roundNumber,
    );

    await applicationRepository
      .createQueryBuilder()
      .update(Application)
      .set({ currentRound: () => 'GREATEST("current_round", :roundNumber)' })
      .where("id = :applicationId", { applicationId: application.id })
      .setParameter(
        "roundNumber",
        nextRound?.roundNumber ?? attempt.round.roundNumber,
      )
      .execute();

    const assessmentRounds = rounds.filter(
      (round) => round.type !== RoundType.INTERVIEW,
    );

    if (assessmentRounds.length === 3) {
      const passedAttempts = await AppDataSource.getRepository(
        AssessmentAttempt,
      ).find({
        where: {
          application: { id: application.id },
          status: AssessmentStatus.PASSED,
          round: { type: Not(RoundType.INTERVIEW) },
        },
        relations: { round: true },
      });

      const passedAllThree = assessmentRounds.every((round) =>
        passedAttempts.some((passed) => passed.round.id === round.id),
      );

      if (passedAllThree) {
        void notifyUsers(
          { role: UserRole.HR },
          {
            eventKey: `application:${application.id}:assessments-cleared`,
            title: "Candidate passed all assessments",
            message: `${application.candidate.name} passed all three assessment rounds for ${application.job.title}.`,
            link: `/candidates/${application.id}`,
          },
        ).catch((error) =>
          console.error("HR assessment notification failed.", error),
        );
      }
    }
  }

  getIO().to(`candidate:${application.candidate.id}`).emit("candidate:updated");
  getIO().to("hr").emit("hr:updated");
};
