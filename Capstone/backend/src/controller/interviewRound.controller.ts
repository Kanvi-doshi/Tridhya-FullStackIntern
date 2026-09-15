import { Request, Response, NextFunction } from "express";

import { AppDataSource } from "../lib/config/db";

import { InterviewRound } from "../lib/entity/InterviewRound";
import { Job } from "../lib/entity/Job";

import { AppError } from "../lib/middleware/error.middleware";

const roundRepository = AppDataSource.getRepository(InterviewRound);

const jobRepository = AppDataSource.getRepository(Job);

// HR - Create interview round
export const createInterviewRound = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
   const jobId = String(req.params.jobId);

    const {
      roundNumber,
      title,
      type,
      description,
      durationMinutes,
      passingScore,
      isActive,
    } = req.body;

    const job = await jobRepository.findOne({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    const existingRound = await roundRepository.findOne({
      where: {
        job: {
          id: jobId,
        },
        roundNumber,
      },
    });

    if (existingRound) {
      throw new AppError(
        `Round ${roundNumber} already exists for this job`,
        409,
      );
    }

    const round = roundRepository.create({
      job,
      roundNumber,
      title,
      type,
      description: description ?? null,
      durationMinutes: durationMinutes ?? null,
      passingScore: passingScore ?? null,
      isActive: isActive ?? true,
    });

    await roundRepository.save(round);

    return res.status(201).json({
      success: true,
      message: "Interview round created successfully",
      round,
    });
  } catch (error) {
    next(error);
  }
};

// Get all rounds for a job
export const getRoundsByJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
   const jobId = String(req.params.jobId);
    const job = await jobRepository.findOne({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    const rounds = await roundRepository.find({
      where: {
        job: {
          id: jobId,
        },
      },
      order: {
        roundNumber: "ASC",
      },
    });

    return res.status(200).json({
      success: true,
      count: rounds.length,
      rounds,
    });
  } catch (error) {
    next(error);
  }
};

// Get one interview round
export const getInterviewRoundById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id  = String(req.params.id);

    const round = await roundRepository.findOne({
      where: {
        id,
      },
      relations: {
        job: true,
      },
    });

    if (!round) {
      throw new AppError("Interview round not found", 404);
    }

    return res.status(200).json({
      success: true,
      round,
    });
  } catch (error) {
    next(error);
  }
};

// HR - Update round
export const updateInterviewRound = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
     const id = String(req.params.id);

    const round = await roundRepository.findOne({
      where: {
        id,
      },
    });

    if (!round) {
      throw new AppError("Interview round not found", 404);
    }

    const {
      roundNumber,
      title,
      type,
      description,
      durationMinutes,
      passingScore,
      isActive,
    } = req.body;

    if (roundNumber !== undefined) {
      round.roundNumber = roundNumber;
    }

    if (title !== undefined) {
      round.title = title;
    }

    if (type !== undefined) {
      round.type = type;
    }

    if (description !== undefined) {
      round.description = description;
    }

    if (durationMinutes !== undefined) {
      round.durationMinutes = durationMinutes;
    }

    if (passingScore !== undefined) {
      round.passingScore = passingScore;
    }

    if (isActive !== undefined) {
      round.isActive = isActive;
    }

    await roundRepository.save(round);

    return res.status(200).json({
      success: true,
      message: "Interview round updated successfully",
      round,
    });
  } catch (error) {
    next(error);
  }
};

// HR - Delete round
export const deleteInterviewRound = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = String(req.params.id);

    const round = await roundRepository.findOne({
      where: {
        id,
      },
    });

    if (!round) {
      throw new AppError("Interview round not found", 404);
    }

    await roundRepository.remove(round);

    return res.status(200).json({
      success: true,
      message: "Interview round deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
