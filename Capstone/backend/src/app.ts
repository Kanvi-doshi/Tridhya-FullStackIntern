import express from "express";
import cors from "cors";
import { errorHandler } from "./lib/middleware/error.middleware";

import authRoutes from "./routes/auth.routes";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/application.routes";
import interviewRoundRoutes from "./routes/interviewRound.routes";
import questionRoutes from "./routes/question.routes";
import assessmentRoutes from "./routes/assessment.routes";
import interviewAssignmentRoutes from "./routes/interviewAssignment.routes";
import interviewFeedbackRoutes from "./routes/interviewFeedback.routes";
import rankingRoutes from "./routes/raking.routes";
import candidateAiRoutes from "./routes/candidateAi.routes";
import reportRoutes from "./routes/report.routes";
import writtenEvaluationRoutes from "./routes/writtenEvaluation.routes";
import hrRoutes from "./routes/hr.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/interview-round", interviewRoundRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/interview-assignment", interviewAssignmentRoutes);
app.use("/api/interview-feedback", interviewFeedbackRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/candidate-ai", candidateAiRoutes);
app.use("/api/written-evaluation", writtenEvaluationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/hr", hrRoutes);

app.use(errorHandler);


export default app;
