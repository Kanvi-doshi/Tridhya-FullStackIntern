import { Request, Response, NextFunction } from "express";
import fs from "fs";
import { AppDataSource } from "../lib/config/db";
import { Application } from "../lib/entity/Application";
import { AppError } from "../lib/middleware/error.middleware";
import { parseResume } from "../lib/utils/resumeParser";
import { analyzeResumeWithAI } from "../lib/services/resumeAi.services";

const applicationRepository = AppDataSource.getRepository(Application);

export const uploadCandidateResume = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const candidateId = req.user!.id;

    const applicationId = String(req.params.applicationId);

    if (!req.file) {
      throw new AppError("Resume file is required", 400);
    }

    const application = await applicationRepository.findOne({
      where: {
        id: applicationId,
        candidate: {
          id: candidateId,
        },
      },
      relations: {
        candidate: true,
        job: true,
      },
    });

    if (!application) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      throw new AppError("Application not found", 404);
    }

    // Remove previous resume if replacing
    if (application.resumePath && fs.existsSync(application.resumePath)) {
      fs.unlinkSync(application.resumePath);
    }

    // Parse PDF / DOCX
    const resumeText = await parseResume(req.file.path);
    if (!resumeText) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw new AppError("Unable to extract text from resume", 400);
    }

    // AI resume analysis
    const analysis = await analyzeResumeWithAI(
      resumeText,
      application.job.title,
      application.job.description,
    );

    application.resumePath = req.file.path;
    application.resumeOriginalName = req.file.originalname;
    application.resumeText = resumeText;
    application.resumeSummary = analysis.summary;
    application.resumeSkills = analysis.skills;
    application.resumeExperience = analysis.experience;
    application.resumeEducation = analysis.education;
    application.resumeStrengths = analysis.strengths;
    application.resumeMissingSkills = analysis.missingSkills;
    application.jobMatchScore = analysis.jobMatchScore;
    
    await applicationRepository.save(application);
    return res.status(200).json({
      success: true,
      message: "Resume uploaded, parsed and analyzed successfully",
      resume: {
        applicationId: application.id,
        fileName: application.resumeOriginalName,
        parsedText: application.resumeText,
        summary: application.resumeSummary,
        skills: application.resumeSkills,
        experience: application.resumeExperience,
        education: application.resumeEducation,
        strengths: application.resumeStrengths,
        missingSkills: application.resumeMissingSkills,
        jobMatchScore: application.jobMatchScore,
      },
    });
  } catch (error) {
    // Remove uploaded file if something fails
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};