import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import { Application, ApplicationStatus } from "../lib/entity/Application";
import { Job, JobStatus } from "../lib/entity/Job";
import { User } from "../lib/entity/User";
import { AppError } from "../lib/middleware/error.middleware";
import { parseResume } from "../lib/utils/resumeParser";
import { analyzeResumeWithAI } from "../lib/services/resumeAi.services";

const applicationRepository = AppDataSource.getRepository(Application);
const jobRepository = AppDataSource.getRepository(Job);
const userRepository = AppDataSource.getRepository(User);

export const applyForJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const jobId = String(req.params.jobId);
    const candidateId = req.user!.id;
    if (!req.file) {
      throw new AppError("Resume is required", 400);
    }

    const job = await jobRepository.findOneBy({
      id: jobId,
    });
    if (!job) {
      throw new AppError("Job not found", 404);
    }
    if (job.status !== JobStatus.OPEN) {
      throw new AppError("Applications are only allowed for open jobs", 400);
    }

    const candidate = await userRepository.findOneBy({
      id: candidateId,
    });
    if (!candidate) {
      throw new AppError("Candidate not found", 404);
    }

    const existingApplication = await applicationRepository.findOne({
      where: {
        candidate: { id: candidateId },
        job: { id: jobId },
      },
    });
    if (existingApplication) {
      throw new AppError("You have already applied for this job", 409);
    }

    const resumeText = await parseResume(req.file.path);
    if (!resumeText) {
      throw new AppError("Unable to read resume", 400);
    }

    const analysis = await analyzeResumeWithAI(
      resumeText,
      job.title,
      job.description,
    );

    const application = applicationRepository.create({
      candidate,
      job,
      status: ApplicationStatus.APPLIED,

      resumePath: req.file.path,
      resumeOriginalName: req.file.originalname,
      resumeText,
      resumeSummary: analysis.summary,
      resumeSkills: analysis.skills,
      resumeExperience: analysis.experience,
      resumeEducation: analysis.education,
      resumeStrengths: analysis.strengths,
      resumeMissingSkills: analysis.missingSkills,
      jobMatchScore: analysis.jobMatchScore,
    });

    await applicationRepository.save(application);

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applications = await applicationRepository.find({
      where: {
        candidate: {
          id: req.user!.id,
        },
      },
      relations: {
        job: true,
      },
      order: {
        appliedAt: "DESC",
      },
    });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationsByJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const jobId = String(req.params.jobId);
    const job = await jobRepository.findOneBy({
      id: jobId,
    });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    const applications = await applicationRepository.find({
      where: {
        job: {
          id: jobId,
        },
      },
      relations: {
        candidate: true,
        job: true,
      },
      order: {
        appliedAt: "DESC",
      },
    });

    const safeApplications = applications.map(
      ({ resumeText, resumePath, ...application }) => application,
    );
    return res.status(200).json({
      success: true,
      count: safeApplications.length,
      applications: safeApplications,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const application = await applicationRepository.findOne({
      where: {
        id,
      },
      relations: {
        candidate: true,
        job: true,
      },
    });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    application.status = status;
    await applicationRepository.save(application);
    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateResume = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicationId = req.params.applicationId;

    if (!applicationId || Array.isArray(applicationId)) {
      throw new AppError("Valid Application ID is required", 400);
    }

    const application = await applicationRepository.findOne({
      where: {
        id: applicationId,
      },
    });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    if (!application.resumePath) {
      throw new AppError("Resume not found for this application", 404);
    }

    if (!fs.existsSync(application.resumePath)) {
      throw new AppError("Resume file does not exist", 404);
    }

    const absolutePath = path.resolve(application.resumePath);

    const download = req.query.download === "true";

    if (download) {
      return res.download(
        absolutePath,
        application.resumeOriginalName || "resume.pdf",
      );
    }

    return res.sendFile(absolutePath);
  } catch (error) {
    next(error);
  }
};
