import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import { InterviewAssignment, InterviewAssignmentStatus } from "../lib/entity/interviewAssignment";
import { InterviewFeedback } from "../lib/entity/interviewFeedback";
import { AppError } from "../lib/middleware/error.middleware";
import { ApplicationStatus } from "../lib/entity/Application";
import { AssessmentAttempt } from "../lib/entity/AssessmentAttempt";

const assignmentRepository = AppDataSource.getRepository(InterviewAssignment);
const feedbackRepository = AppDataSource.getRepository(InterviewFeedback);

// GET MY INTERVIEWS
export const getInterviewerInterviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const interviewerId = req.user!.id;

    const interviews = await assignmentRepository.find({
      where: {
        interviewer: {
          id: interviewerId,
        },
      },
      relations: {
        application: {
          candidate: true,
          job: true,
        },
        round: true,
      },
      order: {
        scheduledAt: "ASC",
      },
    });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE INTERVIEW
export const getInterviewerInterviewById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const interview = await assignmentRepository.findOne({
      where: {
        id: String(req.params.id),
        interviewer: { id: req.user!.id },
      },
      relations: {
        application: {
          candidate: true,
          job: true,
        },
        round: true,
      },
    });

    if (!interview) {
      throw new AppError("Interview not found", 404);
    }

    const [feedback, attempts] = await Promise.all([
      feedbackRepository.findOne({
        where: { assignment: { id: interview.id } },
      }),
      AppDataSource.getRepository(AssessmentAttempt).find({
        where: {
          application: { id: interview.application.id },
        },
        relations: { round: true },
        order: { createdAt: "DESC" },
      }),
    ]);

    const feedbackMessage = feedback
      ? "Feedback has already been submitted."
      : interview.status === InterviewAssignmentStatus.CANCELLED
        ? "This interview has been cancelled."
        : interview.application.status !== ApplicationStatus.INTERVIEWING
          ? "This application is not currently approved for interview."
          : interview.scheduledAt.getTime() > Date.now()
            ? "Feedback becomes available when the interview starts."
            : "";

    return res.json({
      success: true,
      interview,
      feedback,
      canSubmitFeedback: feedbackMessage === "",
      feedbackMessage,
      assessments: attempts
        .filter(
          (attempt, index, all) =>
            all.findIndex((item) => item.round.id === attempt.round.id) ===
            index,
        )
        .sort((a, b) => a.round.roundNumber - b.round.roundNumber)
        .map((attempt) => ({
          id: attempt.id,
          roundNumber: attempt.round.roundNumber,
          title: attempt.round.title,
          status: attempt.status,
          score: attempt.score,
          obtainedMarks: attempt.obtainedMarks,
          totalMarks: attempt.totalMarks,
        })),
    });
  } catch (error) {
    next(error);
  }
};