import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./lib/middleware/error.middleware";

import authRoutes from "./routes/auth.routes";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/application.routes";
import interviewRoundRoutes from "./routes/interviewRound.routes";
import questionRoutes from "./routes/question.routes";
import assessmentRoutes from "./routes/assessment.routes";
import interviewAssignmentRoutes from "./routes/interviewAssignment.routes";
import interviewFeedbackRoutes from "./routes/interviewFeedback.routes";
import evaluationRoutes from "./routes/evaluation.routes";
import candidateAiRoutes from "./routes/candidateAi.routes";
import reportRoutes from "./routes/report.routes";
import writtenEvaluationRoutes from "./routes/writtenEvaluation.routes";
import hrRoutes from "./routes/hr.routes";
import interviewerRoutes from "./routes/interviewer.routes";

import notificationRoutes from "./routes/notification.routes";

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());
// console.log(corsOrigins);
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/interview-round", interviewRoundRoutes);
app.use("/api/interview-assignment", interviewAssignmentRoutes);
app.use("/api/interview-feedback", interviewFeedbackRoutes);
app.use("/api/evaluation", evaluationRoutes);
app.use("/api/candidate-ai", candidateAiRoutes);
app.use("/api/written-evaluation", writtenEvaluationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/interviewer", interviewerRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

export default app;
