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
    const [jobMetrics, applicationMetrics, interviewMetrics] =
      await Promise.all([
        jobRepository
          .createQueryBuilder("job")
          .select("COUNT(job.id)", "total")
          .addSelect("COUNT(job.id) FILTER (WHERE job.status = :open)", "open")
          .setParameter("open", JobStatus.OPEN)
          .getRawOne(),

        applicationRepository
          .createQueryBuilder("application")
          .select("COUNT(application.id)", "total")
          .addSelect(
            "COUNT(application.id) FILTER (WHERE application.status = :shortlisted)",
            "shortlisted",
          )
          .addSelect(
            "COUNT(application.id) FILTER (WHERE application.status = :interviewing)",
            "interviewing",
          )
          .addSelect(
            "COUNT(application.id) FILTER (WHERE application.status = :selected)",
            "selected",
          )
          .addSelect(
            "COUNT(application.id) FILTER (WHERE application.status = :rejected)",
            "rejected",
          )
          .addSelect("AVG(application.job_match_score)", "averageJobMatchScore")
          .addSelect("AVG(application.overall_score)", "averageOverallScore")
          .setParameters({
            shortlisted: ApplicationStatus.SHORTLISTED,
            interviewing: ApplicationStatus.INTERVIEWING,
            selected: ApplicationStatus.SELECTED,
            rejected: ApplicationStatus.REJECTED,
          })
          .getRawOne(),

        interviewAssignmentRepository
          .createQueryBuilder("assignment")
          .select("COUNT(assignment.id)", "total")
          .addSelect(
            "COUNT(assignment.id) FILTER (WHERE assignment.status = :completed)",
            "completed",
          )
          .setParameter("completed", InterviewAssignmentStatus.COMPLETED)
          .getRawOne(),
      ]);

    return res.status(200).json({
      success: true,
      analytics: {
        jobs: {
          total: Number(jobMetrics?.total ?? 0),
          open: Number(jobMetrics?.open ?? 0),
        },
        applications: {
          total: Number(applicationMetrics?.total ?? 0),
          shortlisted: Number(applicationMetrics?.shortlisted ?? 0),
          interviewing: Number(applicationMetrics?.interviewing ?? 0),
          selected: Number(applicationMetrics?.selected ?? 0),
          rejected: Number(applicationMetrics?.rejected ?? 0),
        },
        scores: {
          averageJobMatchScore: Number(
            Number(applicationMetrics?.averageJobMatchScore ?? 0).toFixed(2),
          ),
          averageOverallScore: Number(
            Number(applicationMetrics?.averageOverallScore ?? 0).toFixed(2),
          ),
        },
        interviews: {
          total: Number(interviewMetrics?.total ?? 0),
          completed: Number(interviewMetrics?.completed ?? 0),
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
