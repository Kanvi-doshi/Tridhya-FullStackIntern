import { Request, Response, NextFunction } from "express";
import { In } from "typeorm";
import { AppDataSource } from "../lib/config/db";
import { Application } from "../lib/entity/Application";

import {
  AssessmentAttempt,
  AssessmentStatus,
} from "../lib/entity/AssessmentAttempt";

import { InterviewFeedback } from "../lib/entity/interviewFeedback";
import { AppError } from "../lib/middleware/error.middleware";
import { generateCandidateAISummary } from "../lib/services/candidateAi.services";

const applicationRepository = AppDataSource.getRepository(Application);
const assessmentRepository = AppDataSource.getRepository(AssessmentAttempt);
const feedbackRepository = AppDataSource.getRepository(InterviewFeedback);

export const generateCandidateSummary = async (
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
      relations: {
        candidate: true,
        job: true,
      },
    });
    if (!application) {
      throw new AppError("Application not found", 404);
    }

    if (!application.resumeSummary) {
      throw new AppError("Resume analysis is not available", 400);
    }

    const assessments = await assessmentRepository.find({
      where: {
        application: {
          id: applicationId,
        },
        status: In([AssessmentStatus.PASSED, AssessmentStatus.FAILED]),
      },
    });

    if (assessments.length === 0) {
      throw new AppError("Candidate has no completed assessments", 400);
    }

    const totalAssessmentScore = assessments.reduce(
      (total, assessment) => total + Number(assessment.score || 0),
      0,
    );

    const assessmentScore = Number(
      (totalAssessmentScore / assessments.length).toFixed(2),
    );

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
      throw new AppError("Interview feedback is not available", 400);
    }

    const totalInterviewRating = feedbacks.reduce(
      (total, feedback) => total + Number(feedback.overallRating || 0),
      0,
    );

    const interviewRating = Number(
      (totalInterviewRating / feedbacks.length).toFixed(2),
    );

    const interviewStrengths = feedbacks
      .map((feedback) => feedback.strengths)
      .filter((value): value is string => Boolean(value));

    const interviewWeaknesses = feedbacks
      .map((feedback) => feedback.weaknesses)
      .filter((value): value is string => Boolean(value));

    const interviewComments = feedbacks
      .map((feedback) => feedback.comments)
      .filter((value): value is string => Boolean(value));

    const aiResult = await generateCandidateAISummary({
      candidateName: application.candidate.name,
      jobTitle: application.job.title,
      jobDescription: application.job.description,
      resumeSummary: application.resumeSummary,
      resumeSkills: application.resumeSkills,
      resumeExperience: application.resumeExperience,
      resumeEducation: application.resumeEducation,
      resumeStrengths: application.resumeStrengths,
      resumeMissingSkills: application.resumeMissingSkills,
      jobMatchScore:
        application.jobMatchScore !== null
          ? Number(application.jobMatchScore)
          : null,
      assessmentScore,
      interviewRating,
      interviewStrengths,
      interviewWeaknesses,
      interviewComments,
      overallScore:
        application.overallScore !== null
          ? Number(application.overallScore)
          : null,
    });

    application.aiCandidateSummary = aiResult.summary;
    application.aiStrengths = aiResult.strengths;
    application.aiConcerns = aiResult.concerns;
    application.aiRecommendation = aiResult.recommendation;
    await applicationRepository.save(application);

    return res.status(200).json({
      success: true,
      message: "Candidate AI evaluation generated successfully",
      evaluation: {
        applicationId: application.id,
        candidate: {
          id: application.candidate.id,
          name: application.candidate.name,
          email: application.candidate.email,
        },
        job: {
          id: application.job.id,
          title: application.job.title,
        },
        scores: {
          resumeJobMatch: application.jobMatchScore,
          assessmentScore,
          interviewRating,
          overallScore: application.overallScore,
        },
        ai: {
          summary: application.aiCandidateSummary,
          strengths: application.aiStrengths,
          concerns: application.aiConcerns,
          recommendation: application.aiRecommendation,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
