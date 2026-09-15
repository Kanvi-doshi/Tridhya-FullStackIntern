import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import { Answer } from "../lib/entity/Answer";
import { AssessmentAttempt } from "../lib/entity/AssessmentAttempt";
import { QuestionType } from "../lib/entity/Questions";
import { AppError } from "../lib/middleware/error.middleware";
import { evaluateAssessment } from "../lib/utils/evaluateAssessment";
import { evaluateWrittenWithAI } from "../lib/services/writtenAi.services";

const answerRepository = AppDataSource.getRepository(Answer);
const attemptRepository = AppDataSource.getRepository(AssessmentAttempt);

// MANUAL EVALUATION
export const evaluateWrittenManually = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const answerId = req.params.answerId;
    const { marksObtained, feedback } = req.body;

    if (!answerId || Array.isArray(answerId)) {
      throw new AppError("Valid Answer ID is required", 400);
    }

    const answer = await answerRepository.findOne({
      where: { id: answerId },
      relations: {
        question: true,
        attempt: {
          round: true,
        },
      },
    });

    if (!answer) {
      throw new AppError("Answer not found", 404);
    }

    if (answer.question.type !== QuestionType.WRITTEN) {
      throw new AppError("This is not a written answer", 400);
    }

    if (marksObtained < 0 || marksObtained > answer.question.marks) {
      throw new AppError(
        `Marks must be between 0 and ${answer.question.marks}`,
        400,
      );
    }

    answer.marksObtained = Number(marksObtained);
    answer.evaluationFeedback = feedback || null;

    await answerRepository.save(answer);

    const result = await evaluateAssessment(answer.attempt);
    await attemptRepository.save(answer.attempt);

    return res.status(200).json({
      success: true,
      message: "Written answer evaluated successfully",
      marksObtained: answer.marksObtained,
      assessment: result,
    });
  } catch (error) {
    next(error);
  }
};

// AI EVALUATION
export const evaluateWrittenWithAIController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const answerId = req.params.answerId;

    if (!answerId || Array.isArray(answerId)) {
      throw new AppError("Valid Answer ID is required", 400);
    }

    const answer = await answerRepository.findOne({
      where: { id: answerId },
      relations: {
        question: true,
        attempt: {
          round: true,
        },
      },
    });

    if (!answer) {
      throw new AppError("Answer not found", 404);
    }

    if (answer.question.type !== QuestionType.WRITTEN) {
      throw new AppError("This is not a written answer", 400);
    }

    if (!answer.answerText?.trim()) {
      throw new AppError("Written answer is empty", 400);
    }

    const aiResult = await evaluateWrittenWithAI(
      answer.question.question,
      answer.answerText,
      Number(answer.question.marks),
    );

    answer.marksObtained = aiResult.marksObtained;
    answer.evaluationFeedback = aiResult.feedback;
    await answerRepository.save(answer);

    const result = await evaluateAssessment(answer.attempt);
    await attemptRepository.save(answer.attempt);

    return res.status(200).json({
      success: true,
      message: "Written answer evaluated by AI successfully",
      evaluation: {
        marksObtained: aiResult.marksObtained,
        maxMarks: answer.question.marks,
        feedback: aiResult.feedback,
      },
      assessment: result,
    });
  } catch (error) {
    next(error);
  }
};
