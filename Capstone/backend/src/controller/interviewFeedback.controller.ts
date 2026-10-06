import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import { InterviewFeedback } from "../lib/entity/interviewFeedback";
import { getIO } from "../lib/config/socket";
import {
  InterviewAssignment,
  InterviewAssignmentStatus,
} from "../lib/entity/interviewAssignment";
import { ApplicationStatus } from "../lib/entity/Application";
import { AppError } from "../lib/middleware/error.middleware";

const feedbackRepository = AppDataSource.getRepository(InterviewFeedback);

export const createInterviewFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assignmentId = String(req.params.assignmentId);
    const interviewerId = req.user!.id;
    const {
      technicalRating,
      communicationRating,
      problemSolvingRating,
      strengths,
      weaknesses,
      comments,
      recommendation,
    } = req.body;

    const feedback = await AppDataSource.transaction(async (manager) => {
      await manager.query("SELECT pg_advisory_xact_lock(734921)");
      const assignmentRepository = manager.getRepository(InterviewAssignment);
      const feedbackRepository = manager.getRepository(InterviewFeedback);
      const assignment = await assignmentRepository.findOne({
        where: {
          id: assignmentId,
        },

        relations: {
          interviewer: true,

          application: {
            candidate: true,
            job: true,
          },

          round: true,
        },
      });

      if (!assignment) {
        throw new AppError("Interview assignment not found", 404);
      }

      if (assignment.interviewer.id !== interviewerId) {
        throw new AppError("You are not assigned to this interview", 403);
      }

      if (assignment.status === InterviewAssignmentStatus.CANCELLED) {
        throw new AppError(
          "Cannot submit feedback for a cancelled interview",
          400,
        );
      }
      if (assignment.application.status !== ApplicationStatus.INTERVIEWING) {
        throw new AppError("This application is not currently approved for interview.", 400);
      }
      if (assignment.scheduledAt.getTime() > Date.now()) {
        throw new AppError(
          "Feedback cannot be submitted before the interview starts.",
          400,
        );
      }
    
      const existingFeedback = await feedbackRepository.findOne({
        where: {
          assignment: {
            id: assignmentId,
          },
        },
      });

      if (existingFeedback) {
        throw new AppError(
          "Feedback has already been submitted for this interview",
          409,
        );
      }

      const overallRating =
        (technicalRating + communicationRating + problemSolvingRating) / 3;

      const feedback = feedbackRepository.create({
        assignment,
        interviewer: assignment.interviewer,
        technicalRating,
        communicationRating,
        problemSolvingRating,
        overallRating: Number(overallRating.toFixed(2)),
        strengths: strengths ?? null,
        weaknesses: weaknesses ?? null,
        comments: comments ?? null,
        recommendation,
      });

      await feedbackRepository.save(feedback);

      // Interview finished
      assignment.status = InterviewAssignmentStatus.COMPLETED;
      await assignmentRepository.save(assignment);

      return feedback;
    });

    getIO().to("hr").emit("hr:updated");
    getIO().to("interviewers").emit("interviews:updated");
    getIO().to(`candidate:${feedback.assignment.application.candidate.id}`).emit("candidate:updated");
    return res.status(201).json({
      success: true,
      message: "Interview feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyInterviewFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const interviewerId = req.user!.id;

    const feedback = await feedbackRepository.find({
      where: {
        interviewer: {
          id: interviewerId,
        },
      },

      relations: {
        assignment: {
          application: {
            candidate: true,
            job: true,
          },

          round: true,
        },
      },

      order: {
        createdAt: "DESC",
      },
    });

    return res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};
export const getFeedbackByApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicationId = String(req.params.applicationId);

    const feedback = await feedbackRepository.find({
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

          application: {
            candidate: true,
            job: true,
          },
        },
      },

      order: {
        createdAt: "ASC",
      },
    });

    return res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};
