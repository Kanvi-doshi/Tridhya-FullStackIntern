import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import { Application } from "../lib/entity/Application";
import { AssessmentAttempt } from "../lib/entity/AssessmentAttempt";
import { InterviewRound } from "../lib/entity/InterviewRound";
import { Question } from "../lib/entity/Questions";
import { Answer } from "../lib/entity/Answer";
import { AppError } from "../lib/middleware/error.middleware";

export const getApplicationAssessmentReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicationId = String(req.params.applicationId);

    const application = await AppDataSource.getRepository(Application).findOne({
      where: { id: applicationId },
      relations: { job: true },
    });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    const [rounds, attempts] = await Promise.all([
      AppDataSource.getRepository(InterviewRound).find({
        where: { job: { id: application.job.id } },
        order: { roundNumber: "ASC" },
      }),
      AppDataSource.getRepository(AssessmentAttempt).find({
        where: { application: { id: applicationId } },
        relations: { round: true },
        order: { createdAt: "DESC" },
      }),
    ]);

    // Include inactive rounds when the candidate already attempted them.
    const assessmentRounds = rounds.filter(
      (round) =>
        round.type !== "INTERVIEW" &&
        (round.isActive ||
          attempts.some((attempt) => attempt.round.id === round.id)),
    );

    const review = await Promise.all(
      assessmentRounds.map(async (round) => {
        // Attempts are newest first.
        const attempt = attempts.find((item) => item.round.id === round.id);

        const [questions, answers] = await Promise.all([
          AppDataSource.getRepository(Question).find({
            where: { round: { id: round.id } },
            order: { orderNumber: "ASC", createdAt: "ASC" },
          }),
          attempt
            ? AppDataSource.getRepository(Answer).find({
                where: { attempt: { id: attempt.id } },
                relations: { question: true },
              })
            : Promise.resolve([] as Answer[]),
        ]);

        const answersByQuestion = new Map(
          answers.map((answer) => [answer.question.id, answer]),
        );

        return {
          id: round.id,
          title: round.title,
          type: round.type,
          roundNumber: round.roundNumber,
          passingScore: round.passingScore,
          isActive: round.isActive,
          attempt: attempt
            ? {
                id: attempt.id,
                status: attempt.status,
                score: attempt.score,
                obtainedMarks: attempt.obtainedMarks,
                totalMarks: attempt.totalMarks,
                startedAt: attempt.startedAt,
                submittedAt: attempt.submittedAt,
                autoSubmitted: attempt.autoSubmitted,
                autoSubmitReason: attempt.autoSubmitReason,
                tabSwitchCount: attempt.tabSwitchCount,
                violationCount: attempt.violationCount,
              }
            : null,
          questions: questions.map((question) => {
            const answer = answersByQuestion.get(question.id);

            return {
              id: question.id,
              text: question.question,
              type: question.type,
              marks: question.marks,
              options: question.options,
              correctAnswer: question.correctAnswer,
              answer: answer
                ? {
                    id: answer.id,
                    text: answer.answerText,
                    marksObtained: answer.marksObtained,
                    isCorrect: answer.isCorrect,
                    passedTestCases: answer.passedTestCases,
                    totalTestCases: answer.totalTestCases,
                    feedback: answer.evaluationFeedback,
                  }
                : null,
            };
          }),
        };
      }),
    );

    return res.json({
      success: true,
      rounds: review,
    });
  } catch (error) {
    next(error);
  }
};
