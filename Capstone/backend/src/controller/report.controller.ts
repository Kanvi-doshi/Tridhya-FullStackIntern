import { Request, Response, NextFunction } from "express";
import PDFDocument from "pdfkit";
import { AppDataSource } from "../lib/config/db";
import { Application } from "../lib/entity/Application";
import { AssessmentAttempt } from "../lib/entity/AssessmentAttempt";
import { InterviewRound, RoundType } from "../lib/entity/InterviewRound";
import { InterviewFeedback } from "../lib/entity/interviewFeedback";
import { AppError } from "../lib/middleware/error.middleware";
import { assertAssessmentsPassed } from "../lib/utils/assertAssessmentsPassed";

export const generateCandidateReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicationId = String(req.params.applicationId);
    const stage = req.query.stage ?? "final";

    if (stage !== "assessment" && stage !== "final") {
      throw new AppError("Report stage must be assessment or final.", 400);
    }

    const assessmentOnly = stage === "assessment";

    const application = await AppDataSource.getRepository(Application).findOne({
      where: { id: applicationId },
      relations: { candidate: true, job: true },
    });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    if (!assessmentOnly) {
      await assertAssessmentsPassed(application.id, application.job.id);
    }

    const [rounds, attempts, feedback] = await Promise.all([
      AppDataSource.getRepository(InterviewRound).find({
        where: {
          job: { id: application.job.id },
          isActive: true,
        },
        order: { roundNumber: "ASC" },
      }),
      AppDataSource.getRepository(AssessmentAttempt).find({
        where: { application: { id: applicationId } },
        relations: { round: true },
        order: { createdAt: "DESC" },
      }),
      AppDataSource.getRepository(InterviewFeedback).find({
        where: {
          assignment: {
            application: { id: applicationId },
          },
        },
        relations: {
          interviewer: true,
          assignment: { round: true },
        },
      }),
    ]);

    const finalRounds = rounds.filter(
      (round) => round.type === RoundType.INTERVIEW,
    );

    const finalFeedback = feedback.find(
      (item) => item.assignment.round.id === finalRounds[0]?.id,
    );

    if (!assessmentOnly) {
      if (finalRounds.length !== 1) {
        throw new AppError(
          "One active final interview round is required.",
          400,
        );
      }

      if (!finalFeedback) {
        throw new AppError("Final interview feedback is not available.", 400);
      }

      if (application.overallScore === null) {
        throw new AppError(
          "Calculate the final score before downloading.",
          400,
        );
      }
    }
    const doc = new PDFDocument({ margin: 50 });

    doc.on("error", (error) => res.destroy(error));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="candidate-${application.id}-${stage}-report.pdf"`,
    );

    doc.pipe(res);

    doc
      .fontSize(20)
      .text(
        assessmentOnly
          ? "Candidate Assessment Report"
          : "Final Candidate Evaluation",
        {
          align: "center",
        },
      );
    doc.moveDown();

    doc
      .fontSize(11)
      .text(`Candidate: ${application.candidate.name}`)
      .text(`Email: ${application.candidate.email}`)
      .text(`Job: ${application.job.title}`)
      .text(`Application status: ${application.status}`)
      .text(`Generated: ${new Date().toISOString()}`);

    doc.moveDown();
    if (assessmentOnly) {
      doc
        .fontSize(10)
        .text(
          "Assessment-stage snapshot. Pending and unattempted rounds are not final results. This report does not represent a hiring decision.",
        );
      doc.moveDown();
    }
    doc.fontSize(15).text("Resume Analysis");
    doc
      .fontSize(11)
      .text(`Match score: ${application.jobMatchScore ?? "N/A"}`)
      .text(`Summary: ${application.resumeSummary ?? "Not available"}`)
      .text(
        `Skills: ${application.resumeSkills?.join(", ") || "Not available"}`,
      )
      .text(`Experience: ${application.resumeExperience ?? "Not available"}`)
      .text(`Education: ${application.resumeEducation ?? "Not available"}`);

    doc.moveDown();
    doc.fontSize(15).text("Assessment Results");

    for (const round of rounds.filter(
      (item) => item.type !== RoundType.INTERVIEW,
    )) {
      const attempt = attempts.find((item) => item.round.id === round.id);

      doc.moveDown(0.5);
      doc.fontSize(12).text(`Round ${round.roundNumber}: ${round.title}`);
      doc
        .fontSize(11)
        .text(`Status: ${attempt?.status ?? "Not attempted"}`)
        .text(
          `Score: ${
            attempt?.score == null
              ? "Not evaluated"
              : `${Number(attempt.score).toFixed(2)}%`
          }`,
        )
        .text(
          `Marks: ${attempt?.obtainedMarks ?? "N/A"} / ${attempt?.totalMarks ?? "N/A"}`,
        )
        .text(`Pass mark: ${round.passingScore ?? "N/A"}%`);
      doc
        .fontSize(11)
        .text(`Recorded tab switches: ${attempt?.tabSwitchCount ?? 0}`)
        .text(`Recorded violations: ${attempt?.violationCount ?? 0}`)
        .text(
          `Automatically submitted: ${attempt?.autoSubmitted ? "Yes" : "No"}`,
        );

      if (attempt?.autoSubmitReason) {
        doc.text(
          `Submission reason: ${attempt.autoSubmitReason.replace(/_/g, " ")}`,
        );
      }
    }

    if (!assessmentOnly && finalFeedback) {
      doc.moveDown();
      doc.fontSize(15).text("Final Interview Feedback");
      doc
        .fontSize(11)
        .text(`Interviewer: ${finalFeedback.interviewer.name}`)
        .text(`Technical: ${finalFeedback.technicalRating} / 5`)
        .text(`Communication: ${finalFeedback.communicationRating} / 5`)
        .text(`Problem solving: ${finalFeedback.problemSolvingRating} / 5`)
        .text(`Overall rating: ${finalFeedback.overallRating} / 5`)
        .text(
          `Recommendation: ${finalFeedback.recommendation.replace(/_/g, " ")}`,
        )
        .text(`Strengths: ${finalFeedback.strengths || "Not provided"}`)
        .text(`Weaknesses: ${finalFeedback.weaknesses || "Not provided"}`)
        .text(`Comments: ${finalFeedback.comments || "Not provided"}`);

      doc.moveDown();
      doc.fontSize(15).text("Final Score");
      doc.fontSize(12).text(`${Number(application.overallScore).toFixed(2)}%`);
      doc
        .fontSize(10)
        .text("Weighting: assessments 60%, interview performance 40%.");

      doc.moveDown();
      doc.fontSize(15).text("AI-Assisted Summary");
      doc
        .fontSize(11)
        .text(application.aiCandidateSummary || "Not generated")
        .text(
          `Recommendation: ${application.aiRecommendation || "Not generated"}`,
        );

      doc.moveDown(0.5);
      doc.text("Strengths:");
      for (const strength of application.aiStrengths ?? []) {
        doc.text(`- ${strength}`);
      }

      doc.moveDown(0.5);
      doc.text("Concerns:");
      for (const concern of application.aiConcerns ?? []) {
        doc.text(`- ${concern}`);
      }

      doc.moveDown();
      doc
        .fontSize(10)
        .text(
          "AI analysis supports review. The final hiring decision belongs to HR.",
        );
    }

    doc.end();
  } catch (error) {
    if (res.headersSent) {
      res.destroy(error instanceof Error ? error : undefined);
      return;
    }

    next(error);
  }
};
