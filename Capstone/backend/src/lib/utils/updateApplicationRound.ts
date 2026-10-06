import { AppDataSource } from "../config/db";
import { getIO } from "../config/socket";
import { Application, ApplicationStatus } from "../entity/Application";
import { AssessmentAttempt, AssessmentStatus } from "../entity/AssessmentAttempt";
import { InterviewRound } from "../entity/InterviewRound";

export const updateApplicationRound = async (attempt: AssessmentAttempt) => {
  const applicationRepository = AppDataSource.getRepository(Application);
  const application = await applicationRepository.findOne({
    where: { id: attempt.application.id },
    relations: { job: true, candidate: true },
  });
  if (!application) return;

  if (attempt.status === AssessmentStatus.FAILED) {
    application.status = ApplicationStatus.REJECTED;
    application.currentRound = attempt.round.roundNumber;
    await applicationRepository.save(application);
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
      .setParameter("roundNumber", nextRound?.roundNumber ?? attempt.round.roundNumber)
      .execute();
  }

  getIO().to(`candidate:${application.candidate.id}`).emit("candidate:updated");
};
