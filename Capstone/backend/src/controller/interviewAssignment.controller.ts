import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import {
  InterviewAssignment,
  InterviewAssignmentStatus,
} from "../lib/entity/interviewAssignment";
import { Application } from "../lib/entity/Application";
import { InterviewRound, RoundType } from "../lib/entity/InterviewRound";
import { User, UserRole } from "../lib/entity/User";
import { AppError } from "../lib/middleware/error.middleware";

const assignmentRepository = AppDataSource.getRepository(InterviewAssignment);
const applicationRepository = AppDataSource.getRepository(Application);
const roundRepository = AppDataSource.getRepository(InterviewRound);
const userRepository = AppDataSource.getRepository(User);

export const createInterviewAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicationId = String(req.params.applicationId);
    const roundId = String(req.params.roundId);
    const { interviewerId, scheduledAt, location } = req.body;
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

    const round = await roundRepository.findOne({
      where: {
        id: roundId,
      },
      relations: {
        job: true,
      },
    });

    if (!round) {
      throw new AppError("Interview round not found", 404);
    }

    // Make sure round belongs to the same job application
    if (round.job.id !== application.job.id) {
      throw new AppError(
        "This interview round does not belong to the applied job",
        400,
      );
    }

    // Assignment only for actual interview rounds
    if (round.type !== RoundType.INTERVIEW) {
      throw new AppError(
        "Interviewer can only be assigned to an interview round",
        400,
      );
    }

    const interviewer = await userRepository.findOne({
      where: {
        id: interviewerId,
      },
    });

    if (!interviewer) {
      throw new AppError("Interviewer not found", 404);
    }

    if (interviewer.role !== UserRole.INTERVIEWER) {
      throw new AppError("Selected user is not an interviewer", 400);
    }

    const existingAssignment = await assignmentRepository.findOne({
      where: {
        application: {
          id: applicationId,
        },
        round: {
          id: roundId,
        },
      },
    });

    if (existingAssignment) {
      throw new AppError(
        "An interviewer is already assigned for this interview round",
        409,
      );
    }

    const interviewDate = new Date(scheduledAt);
    if (interviewDate.getTime() <= Date.now()) {
      throw new AppError(
        "Interview must be scheduled for a future date and time",
        400,
      );
    }

    const assignment = assignmentRepository.create({
      application,
      round,
      interviewer,
      scheduledAt: interviewDate,
      location,
      status: InterviewAssignmentStatus.SCHEDULED,
    });

    await assignmentRepository.save(assignment);

    return res.status(201).json({
      success: true,
      message: "Interview assigned successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAssignedInterviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const interviewerId = req.user!.id;
    const assignments = await assignmentRepository.find({
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
      assignments,
    });
  } catch (error) {
    next(error);
  }
};
export const getMyInterviewSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const candidateId = req.user!.id;
    const assignments = await assignmentRepository.find({
      where: {
        application: {
          candidate: {
            id: candidateId,
          },
        },
      },
      relations: {
        application: {
          job: true,
        },
        round: true,
        interviewer: true,
      },
      order: {
        scheduledAt: "ASC",
      },
    });

    return res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    next(error);
  }
};
export const getAllInterviewAssignments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assignments = await assignmentRepository.find({
      relations: {
        application: {
          candidate: true,
          job: true,
        },
        round: true,
        interviewer: true,
      },
      order: {
        scheduledAt: "ASC",
      },
    });
    return res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInterviewAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = String(req.params.id);
    const { interviewerId, scheduledAt, location, status } = req.body;
    const assignment = await assignmentRepository.findOne({
      where: {
        id,
      },
      relations: {
        interviewer: true,
      },
    });

    if (!assignment) {
      throw new AppError("Interview assignment not found", 404);
    }

    if (interviewerId) {
      const interviewer = await userRepository.findOne({
        where: {
          id: interviewerId,
        },
      });

      if (!interviewer) {
        throw new AppError("Interviewer not found", 404);
      }

      if (interviewer.role !== UserRole.INTERVIEWER) {
        throw new AppError("Selected user is not an interviewer", 400);
      }
      assignment.interviewer = interviewer;
    }

    if (scheduledAt) {
      const interviewDate = new Date(scheduledAt);
      if (interviewDate.getTime() <= Date.now()) {
        throw new AppError(
          "Interview must be scheduled for a future date and time",
          400,
        );
      }
      assignment.scheduledAt = interviewDate;
    }

    if (location !== undefined) {
      assignment.location = location;
    }

    if (status) {
      assignment.status = status;
    }

    await assignmentRepository.save(assignment);
    return res.status(200).json({
      success: true,
      message: "Interview assignment updated successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
};
