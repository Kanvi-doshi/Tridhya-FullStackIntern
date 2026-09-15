import { Request, Response, NextFunction } from "express";

import { AppDataSource } from "../lib/config/db";
import { Job } from "../lib/entity/Job";
import { AppError } from "../lib/middleware/error.middleware";

const jobRepository = AppDataSource.getRepository(Job);

// CREATE JOB
export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { title, description, location, experienceRequired, skills, status } =
      req.body;

    const job = jobRepository.create({
      title,
      description,
      location,
      experienceRequired,
      skills,
      status,
      createdBy: req.user,
    });

    await jobRepository.save(job);

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL JOBS
export const getJobs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const jobs = await jobRepository.find({
      relations: {
        createdBy: true,
      },
      order: {
        createdAt: "DESC",
      },
    });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE JOB
export const getJobById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      throw new AppError("Valid Job ID is required", 400);
    }

    const job = await jobRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        createdBy: true,
      },
    });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE JOB
export const updateJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      throw new AppError("Valid Job ID is required", 400);
    }

    const job = await jobRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    jobRepository.merge(job, req.body);

    await jobRepository.save(job);

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE JOB
export const deleteJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      throw new AppError("Valid Job ID is required", 400);
    }

    const job = await jobRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    await jobRepository.remove(job);

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
