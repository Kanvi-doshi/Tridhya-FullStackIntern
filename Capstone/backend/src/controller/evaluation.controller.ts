import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import { Application } from "../lib/entity/Application";
import {
  AssessmentAttempt,
  AssessmentStatus,
} from "../lib/entity/AssessmentAttempt";
import { getIO } from "../lib/config/socket";
import { InterviewFeedback } from "../lib/entity/interviewFeedback";
import { calculateOverallScore } from "../lib/utils/calculateOverallScore";
import { AppError } from "../lib/middleware/error.middleware";

const applicationRepository = AppDataSource.getRepository(Application);
const attemptRepository = AppDataSource.getRepository(AssessmentAttempt);
const feedbackRepository = AppDataSource.getRepository(InterviewFeedback);

export const calculateCandidateScore = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicationId = String(req.params.applicationId);
    const application = await applicationRepository.findOne({
      where: {
        id: applicationId,
      },
      relations: {
        candidate: true,
        job: true,
      },
    });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    const attempts = await attemptRepository.find({
      where: {
        application: {
          id: applicationId,
        },
      },
      relations: {
        round: true,
      },
    });

    const completedAttempts = attempts.filter(
      (attempt) =>
        attempt.status === AssessmentStatus.PASSED ||
        attempt.status === AssessmentStatus.FAILED,
    );

    if (completedAttempts.length === 0) {
      throw new AppError("No completed assessment found", 400);
    }

    const totalAssessmentScore = completedAttempts.reduce(
      (total, attempt) => total + Number(attempt.score ?? 0),
      0,
    );

    const averageAssessmentScore =
      totalAssessmentScore / completedAttempts.length;

    const feedbacks = await feedbackRepository.find({
      where: {
        assignment: {
          application: {
            id: applicationId,
          },
        },
      },
      relations: {
        assignment: {
          application: true,
        },
      },
    });

    if (feedbacks.length === 0) {
      throw new AppError("Interview feedback not found", 400);
    }

    const totalInterviewRating = feedbacks.reduce(
      (total, feedback) => total + Number(feedback.overallRating),
      0,
    );

    const averageInterviewRating = totalInterviewRating / feedbacks.length;
    const overallScore = calculateOverallScore(
      averageAssessmentScore,
      averageInterviewRating,
    );
    application.overallScore = overallScore;
    await applicationRepository.save(application);

    getIO().to("hr").emit("hr:updated");

    return res.status(200).json({
      success: true,
      message: "Candidate overall score calculated successfully",
      candidate: {
        applicationId: application.id,
        candidateId: application.candidate.id,
        candidateName: application.candidate.name,
        jobId: application.job.id,
        jobTitle: application.job.title,
        assessmentPerformance: Number(averageAssessmentScore.toFixed(2)),
        interviewPerformance: Number(averageInterviewRating.toFixed(2)),
        normalizedInterviewPerformance: Number(
          ((averageInterviewRating / 5) * 100).toFixed(2),
        ),
        assessmentWeight: "60%",
        interviewWeight: "40%",
        overallScore,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateEvaluation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicationId = String(req.params.applicationId);
    const application = await applicationRepository.findOne({
      where: {
        id: applicationId,
      },
      relations: {
        candidate: true,
        job: true,
      },
    });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    const attempts = await attemptRepository.find({
      where: {
        application: {
          id: applicationId,
        },
      },
      relations: {
        round: true,
      },
    });

    const feedbacks = await feedbackRepository.find({
      where: {
        assignment: {
          application: {
            id: applicationId,
          },
        },
      },
      relations: {
        interviewer: true,
        assignment: {
          round: true,
        },
      },
    });

    return res.status(200).json({
      success: true,
      candidate: {
        id: application.candidate.id,
        name: application.candidate.name,
        email: application.candidate.email,
      },
      job: {
        id: application.job.id,
        title: application.job.title,
      },
      applicationStatus: application.status,
      overallScore: application.overallScore,
      assessments: attempts.map((attempt) => ({
        round: attempt.round.title,
        score: attempt.score,
        status: attempt.status,
        obtainedMarks: attempt.obtainedMarks,
        totalMarks: attempt.totalMarks,
      })),

      interviews: feedbacks.map((feedback) => ({
        round: feedback.assignment.round.title,
        interviewer: feedback.interviewer.name,
        technicalRating: feedback.technicalRating,
        communicationRating: feedback.communicationRating,
        problemSolvingRating: feedback.problemSolvingRating,
        overallRating: feedback.overallRating,
        recommendation: feedback.recommendation,
        strengths: feedback.strengths,
        weaknesses: feedback.weaknesses,
        comments: feedback.comments,
      })),
    });
  } catch (error) {
    next(error);
  }
};
