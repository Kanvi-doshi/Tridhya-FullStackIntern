import { Request, Response, NextFunction } from "express";
import PDFDocument from "pdfkit";
import { AppDataSource } from "../lib/config/db";
import { Application } from "../lib/entity/Application";
import { AppError } from "../lib/middleware/error.middleware";

const applicationRepository = AppDataSource.getRepository(Application);

export const generateCandidateReport = async (
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
      where: { id: applicationId },
      relations: {
        candidate: true,
        job: true,
      },
    });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${application.candidate.name}-evaluation.pdf"`,
    );

    doc.pipe(res);

    doc.fontSize(20).text("Candidate Evaluation Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text("Candidate Information");
    doc
      .fontSize(11)
      .text(`Name: ${application.candidate.name}`)
      .text(`Email: ${application.candidate.email}`)
      .text(`Job: ${application.job.title}`)
      .text(`Status: ${application.status}`);

    doc.moveDown();

    doc.fontSize(14).text("Resume Analysis");
    doc
      .fontSize(11)
      .text(`Job Match Score: ${application.jobMatchScore ?? "N/A"}`)
      .text(`Summary: ${application.resumeSummary ?? "N/A"}`)
      .text(`Skills: ${application.resumeSkills?.join(", ") || "N/A"}`)
      .text(`Experience: ${application.resumeExperience ?? "N/A"}`)
      .text(`Education: ${application.resumeEducation ?? "N/A"}`);

    doc.moveDown();

    doc.fontSize(14).text("Final Evaluation");
    doc
      .fontSize(11)
      .text(`Overall Score: ${application.overallScore ?? "N/A"}`)
      .text(`Recommendation: ${application.aiRecommendation ?? "N/A"}`)
      .text(`Summary: ${application.aiCandidateSummary ?? "N/A"}`);

    doc.moveDown();

    doc.fontSize(14).text("Strengths");
    application.aiStrengths?.forEach((strength) => {
      doc.fontSize(11).text(`• ${strength}`);
    });

    if (!application.aiStrengths?.length) {
      doc.fontSize(11).text("N/A");
    }

    doc.moveDown();

    doc.fontSize(14).text("Concerns");
    application.aiConcerns?.forEach((concern) => {
      doc.fontSize(11).text(`• ${concern}`);
    });

    if (!application.aiConcerns?.length) {
      doc.fontSize(11).text("N/A");
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};
