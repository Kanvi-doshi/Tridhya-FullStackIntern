import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import { Application, ApplicationStatus } from "../lib/entity/Application";
import { Job, JobStatus } from "../lib/entity/Job";
import { User, UserRole } from "../lib/entity/User";
import { Not } from "typeorm";
import {
  InterviewAssignment,
  InterviewAssignmentStatus,
} from "../lib/entity/interviewAssignment";
import { getIO } from "../lib/config/socket";
import { AppError } from "../lib/middleware/error.middleware";
import { parseResume } from "../lib/utils/resumeParser";
import { getAssessmentStats } from "../lib/utils/getAssessmentStats";
import { analyzeResumeWithAI } from "../lib/services/resumeAi.services";
import { assertAssessmentsPassed } from "../lib/utils/assertAssessmentsPassed";
import { InterviewRound, RoundType } from "../lib/entity/InterviewRound";
import { InterviewFeedback } from "../lib/entity/interviewFeedback";

import { notifyUsers } from "../lib/services/notification.service";

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

    void notifyUsers(
      { userIds: [candidate.id] },
      {
        eventKey: `application:${application.id}:applied`,
        title: "Application submitted",
        message: `Your application for ${job.title} was submitted successfully.`,
        link: `/application/${application.id}`,
      },
      true,
    ).catch((error) =>
      console.error("Candidate application notification failed.", error),
    );

    void notifyUsers(
      { role: UserRole.HR },
      {
        eventKey: `application:${application.id}:hr-applied`,
        title: "New job application",
        message: `${candidate.name} applied for ${job.title}.`,
        link: `/candidates/${application.id}`,
      },
    ).catch((error) =>
      console.error("HR application notification failed.", error),
    );

    getIO().to("hr").emit("hr:updated");
    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Check ownership and status in the DELETE itself, including concurrent HR changes.
    const result = await applicationRepository.delete({
      id: String(req.params.id),
      candidate: { id: req.user!.id },
      status: ApplicationStatus.APPLIED,
    });

    if (!result.affected) {
      throw new AppError(
        "Application cannot be cancelled. Only your own applications still marked APPLIED can be removed.",
        409,
      );
    }

    getIO().to("hr").emit("hr:updated");
    getIO()
      .to(`candidate:${req.user!.id}`)
      .emit("application:statusChanged", {
        applicationId: String(req.params.id),
      });
    return res.json({
      success: true,
      message: "Application cancelled successfully",
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

    const safeApplications = applications.map((application) => {
      const { resumeText, resumePath, ...safeApplication } = application;
      return safeApplication;
    });

    return res.status(200).json({
      success: true,
      count: safeApplications.length,
      applications: safeApplications,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicationId = String(req.params.id);
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

    const stats = await getAssessmentStats([application]);
    const assessmentStats = stats.get(application.id)!;

    return res.status(200).json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        overallScore: application.overallScore,
        currentRound: assessmentStats.currentRound,
        assessmentScore: assessmentStats.assessmentScore,

        resumeOriginalName: application.resumeOriginalName,
        resumeSummary: application.resumeSummary,
        resumeSkills: application.resumeSkills,
        resumeExperience: application.resumeExperience,
        resumeEducation: application.resumeEducation,
        resumeStrengths: application.resumeStrengths,
        resumeMissingSkills: application.resumeMissingSkills,

        jobMatchScore: application.jobMatchScore,

        aiCandidateSummary: application.aiCandidateSummary,
        aiRecommendation: application.aiRecommendation,
        aiStrengths: application.aiStrengths,
        aiConcerns: application.aiConcerns,

        appliedAt: application.appliedAt,
        updatedAt: application.updatedAt,

        candidate: {
          id: application.candidate.id,
          name: application.candidate.name,
          email: application.candidate.email,
        },

        job: application.job,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllApplications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applications = await applicationRepository.find({
      relations: {
        candidate: true,
        job: true,
      },
      order: {
        appliedAt: "DESC",
      },
    });
    const stats = await getAssessmentStats(applications);
    // Return only the fields needed by the Candidates list.
    const results = applications.map((application) => ({
      id: application.id,
      status: application.status,
      currentRound: stats.get(application.id)!.currentRound,
      assessmentScore: stats.get(application.id)!.assessmentScore,
      jobMatchScore: application.jobMatchScore,
      overallScore: application.overallScore,
      appliedAt: application.appliedAt,

      candidate: {
        id: application.candidate.id,
        name: application.candidate.name,
        email: application.candidate.email,
      },

      job: {
        id: application.job.id,
        title: application.job.title,
        location: application.job.location,
      },
    }));

    return res.status(200).json({
      success: true,
      count: results.length,
      applications: results,
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
    const requestedStatus: unknown = req.body.status;
    if (
      typeof requestedStatus !== "string" ||
      !Object.values(ApplicationStatus).includes(
        requestedStatus as ApplicationStatus,
      )
    ) {
      throw new AppError("Invalid application status", 400);
    }

    const status = requestedStatus as ApplicationStatus;
    const application = await applicationRepository.findOne({
      where: { id },
      relations: {
        candidate: true,
        job: true,
      },
    });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    // Repeating the same status makes no change.
    if (status === application.status) {
      return res.json({
        success: true,
        message: "Application already has this status",
        application,
      });
    }

    const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      [ApplicationStatus.APPLIED]: [
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.SHORTLISTED]: [
        ApplicationStatus.INTERVIEWING,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.INTERVIEWING]: [
        ApplicationStatus.SELECTED,
        ApplicationStatus.REJECTED,
      ],
      [ApplicationStatus.SELECTED]: [],
      [ApplicationStatus.REJECTED]: [],
    };

    if (!transitions[application.status].includes(status)) {
      throw new AppError(
        `Cannot change ${application.status} to ${status}.`,
        400,
      );
    }

    if (
      status === ApplicationStatus.INTERVIEWING ||
      status === ApplicationStatus.SELECTED
    ) {
      await assertAssessmentsPassed(application.id, application.job.id);
    }

    if (
      application.status === ApplicationStatus.INTERVIEWING &&
      (status === ApplicationStatus.SELECTED ||
        status === ApplicationStatus.REJECTED)
    ) {
      const interviewRounds = await AppDataSource.getRepository(
        InterviewRound,
      ).find({
        where: {
          job: { id: application.job.id },
          type: RoundType.INTERVIEW,
          isActive: true,
        },
      });

      if (interviewRounds.length !== 1) {
        throw new AppError(
          "Configure one active final interview round before selection.",
          400,
        );
      }

      const feedback = await AppDataSource.getRepository(
        InterviewFeedback,
      ).findOne({
        where: {
          assignment: {
            application: { id: application.id },
            round: { id: interviewRounds[0].id },
          },
        },
      });

      if (!feedback) {
        throw new AppError(
          "Final interview feedback is required before selecting the candidate.",
          400,
        );
      }
    }
    if (
      application.status === ApplicationStatus.SHORTLISTED &&
      status === ApplicationStatus.REJECTED
    ) {
      await assertAssessmentsPassed(application.id, application.job.id);
    }

    const updated = await applicationRepository.update(
      { id: application.id, status: application.status },
      { status },
    );
    if (!updated.affected) {
      throw new AppError(
        "Application changed or was cancelled. Refresh and try again.",
        409,
      );
    }
    application.status = status;

    const statusMessages: Partial<Record<ApplicationStatus, string>> = {
      [ApplicationStatus.SHORTLISTED]: `You have been shortlisted for ${application.job.title}. 
      
      You can now start the assessments from your application page. Complete the three assessment rounds in order.

      Assessment 1: Mcq round
      Assessment 2: Coding
      Assessment 3: Written 

      Failing an assessment or triggering a tab-switch or camera violation will result in rejection. Also make sure to attempt this assessment within 2-3 days.`,

      [ApplicationStatus.INTERVIEWING]: `HR approved you for the final interview for ${application.job.title}.`,

      [ApplicationStatus.SELECTED]: `You have been selected for ${application.job.title}.`,

      [ApplicationStatus.REJECTED]: `Your application for ${application.job.title} was rejected. Sign in to view your application status.`,
    };

    const statusMessage = statusMessages[status];

    if (statusMessage) {
      void notifyUsers(
        { userIds: [application.candidate.id] },
        {
          eventKey: `application:${application.id}:status:${status}`,
          title:
            status === ApplicationStatus.SHORTLISTED
              ? "You have been shortlisted"
              : `Application ${status.toLowerCase()}`,
          message: statusMessage,
          link: `/application/${application.id}`,
        },
        true,
      ).catch((error) =>
        console.error("Application status notification failed.", error),
      );
    }

    getIO()
      .to(`candidate:${application.candidate.id}`)
      .emit("application:statusChanged", {
        applicationId: application.id,
        status: application.status,
      });
    getIO().to("hr").emit("hr:updated");
    getIO().to("interviewers").emit("interviews:updated");

    return res.json({
      success: true,
      message:
        status === ApplicationStatus.SHORTLISTED
          ? "Candidate shortlisted. Assessments are now available."
          : status === ApplicationStatus.INTERVIEWING
            ? "Candidate approved for the final interview."
            : "Application status updated successfully",
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
    if (req.user!.role === UserRole.INTERVIEWER) {
      const assignment = await AppDataSource.getRepository(
        InterviewAssignment,
      ).findOne({
        where: {
          application: { id: applicationId },
          interviewer: { id: req.user!.id },
          status: Not(InterviewAssignmentStatus.CANCELLED),
        },
      });
      if (!assignment) {
        throw new AppError("You are not assigned to this candidate.", 403);
      }
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
