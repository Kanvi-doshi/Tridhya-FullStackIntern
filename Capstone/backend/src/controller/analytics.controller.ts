import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import { Job, JobStatus } from "../lib/entity/Job";
import { Application, ApplicationStatus } from "../lib/entity/Application";
import {
  InterviewAssignment,
  InterviewAssignmentStatus,
} from "../lib/entity/interviewAssignment";

const jobRepository = AppDataSource.getRepository(Job);
const applicationRepository = AppDataSource.getRepository(Application);
const interviewAssignmentRepository =
  AppDataSource.getRepository(InterviewAssignment);

export const getDashboardAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const totalJobs = await jobRepository.count();
    const openJobs = await jobRepository.count({
      where: {
        status: JobStatus.OPEN,
      },
    });

    const totalApplications = await applicationRepository.count();
    const shortlistedCandidates = await applicationRepository.count({
      where: {
        status: ApplicationStatus.SHORTLISTED,
      },
    });
    const interviewingCandidates = await applicationRepository.count({
      where: {
        status: ApplicationStatus.INTERVIEWING,
      },
    });
    const selectedCandidates = await applicationRepository.count({
      where: {
        status: ApplicationStatus.SELECTED,
      },
    });
    const rejectedCandidates = await applicationRepository.count({
      where: {
        status: ApplicationStatus.REJECTED,
      },
    });

    const scoreResult = await applicationRepository
      .createQueryBuilder("application")
      .select("AVG(application.job_match_score)", "averageJobMatchScore")
      .addSelect("AVG(application.overall_score)", "averageOverallScore")
      .getRawOne();

    const averageJobMatchScore = Number(
      Number(scoreResult?.averageJobMatchScore || 0).toFixed(2),
    );

    const averageOverallScore = Number(
      Number(scoreResult?.averageOverallScore || 0).toFixed(2),
    );

    const totalInterviews = await interviewAssignmentRepository.count();
    const completedInterviews = await interviewAssignmentRepository.count({
      where: {
        status: InterviewAssignmentStatus.COMPLETED,
      },
    });

    return res.status(200).json({
      success: true,
      analytics: {
        jobs: {
          total: totalJobs,
          open: openJobs,
        },
        applications: {
          total: totalApplications,
          shortlisted: shortlistedCandidates,
          interviewing: interviewingCandidates,
          selected: selectedCandidates,
          rejected: rejectedCandidates,
        },
        scores: {
          averageJobMatchScore,
          averageOverallScore,
        },
        interviews: {
          total: totalInterviews,
          completed: completedInterviews,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getJobAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const jobId = req.params.jobId;

    if (!jobId || Array.isArray(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Job ID is required",
      });
    }

    const job = await jobRepository.findOne({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const totalApplications = await applicationRepository.count({
      where: {
        job: {
          id: jobId,
        },
      },
    });

    const applied = await applicationRepository.count({
      where: {
        job: {
          id: jobId,
        },
        status: ApplicationStatus.APPLIED,
      },
    });

    const shortlisted = await applicationRepository.count({
      where: {
        job: {
          id: jobId,
        },
        status: ApplicationStatus.SHORTLISTED,
      },
    });

    const interviewing = await applicationRepository.count({
      where: {
        job: {
          id: jobId,
        },
        status: ApplicationStatus.INTERVIEWING,
      },
    });

    const selected = await applicationRepository.count({
      where: {
        job: {
          id: jobId,
        },
        status: ApplicationStatus.SELECTED,
      },
    });

    const rejected = await applicationRepository.count({
      where: {
        job: {
          id: jobId,
        },
        status: ApplicationStatus.REJECTED,
      },
    });

    const scoreResult = await applicationRepository
      .createQueryBuilder("application")
      .select("AVG(application.job_match_score)", "averageJobMatchScore")
      .addSelect("AVG(application.overall_score)", "averageOverallScore")
      .where("application.job_id = :jobId", {
        jobId,
      })
      .getRawOne();

    const averageJobMatchScore = Number(
      Number(scoreResult?.averageJobMatchScore || 0).toFixed(2),
    );

    const averageOverallScore = Number(
      Number(scoreResult?.averageOverallScore || 0).toFixed(2),
    );

    const topCandidates = await applicationRepository.find({
      where: {
        job: {
          id: jobId,
        },
      },
      relations: {
        candidate: true,
      },
      order: {
        overallScore: "DESC",
      },
      take: 5,
    });

    const safeTopCandidates = topCandidates.map((application) => ({
      applicationId: application.id,
      candidate: {
        id: application.candidate.id,
        name: application.candidate.name,
        email: application.candidate.email,
      },
      status: application.status,
      jobMatchScore: application.jobMatchScore,
      overallScore: application.overallScore,
      recommendation: application.aiRecommendation,
    }));

    return res.status(200).json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
      },
      analytics: {
        totalApplications,
        status: {
          applied,
          shortlisted,
          interviewing,
          selected,
          rejected,
        },
        scores: {
          averageJobMatchScore,
          averageOverallScore,
        },
        topCandidates: safeTopCandidates,
      },
    });
  } catch (error) {
    next(error);
  }
};
