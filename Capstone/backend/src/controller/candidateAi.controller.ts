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
    const applicationId = String(req.params.applicationId);

    // GET APPLICATION
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

    // GET ASSESSMENT RESULTS
    const assessments = await assessmentRepository.find({
      where: {
        application: {
          id: applicationId,
        },
        status: In([AssessmentStatus.PASSED, AssessmentStatus.FAILED]),
      },
    });

    let assessmentScore = 0;

    if (assessments.length > 0) {
      const totalAssessmentScore = assessments.reduce(
        (total, assessment) => total + Number(assessment.score || 0),
        0,
      );
      assessmentScore = totalAssessmentScore / assessments.length;
    }
    assessmentScore = Number(assessmentScore.toFixed(2));

    // GET INTERVIEW FEEDBACK
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

    let interviewRating = 0;
    if (feedbacks.length > 0) {
      const totalRating = feedbacks.reduce(
        (total, feedback) => total + Number(feedback.overallRating || 0),
        0,
      );
      interviewRating = totalRating / feedbacks.length;
    }

    interviewRating = Number(interviewRating.toFixed(2));

    // COLLECT FEEDBACK DETAILS
    const interviewStrengths = feedbacks
      .map((feedback) => feedback.strengths)
      .filter((strength): strength is string => Boolean(strength));

    const interviewWeaknesses = feedbacks
      .map((feedback) => feedback.weaknesses)
      .filter((weakness): weakness is string => Boolean(weakness));

    const interviewComments = feedbacks
      .map((feedback) => feedback.comments)
      .filter((comment): comment is string => Boolean(comment));

    // CALL GEMINI
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
      jobMatchScore: application.jobMatchScore
        ? Number(application.jobMatchScore)
        : null,
      assessmentScore,
      interviewRating,
      interviewStrengths,
      interviewWeaknesses,
      interviewComments,
      overallScore: application.overallScore
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
      message: "Candidate AI summary generated successfully",
      candidate: {
        applicationId: application.id,
        candidateName: application.candidate.name,
        jobTitle: application.job.title,
        assessmentScore,
        interviewRating,
        overallScore: application.overallScore,
        jobMatchScore: application.jobMatchScore,
        aiSummary: application.aiCandidateSummary,
        strengths: application.aiStrengths,
        concerns: application.aiConcerns,
        recommendation: application.aiRecommendation,
      },
    });
  } catch (error) {
    next(error);
  }
};
