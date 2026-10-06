import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import { Question, QuestionType } from "../lib/entity/Questions";
import { InterviewRound } from "../lib/entity/InterviewRound";
import { AppError } from "../lib/middleware/error.middleware";
import { createQuestionSchema } from "../lib/validation/question.validation";
import { AssessmentAttempt } from "../lib/entity/AssessmentAttempt";
import { getIO } from "../lib/config/socket";

const questionRepository = AppDataSource.getRepository(Question);
const roundRepository = AppDataSource.getRepository(InterviewRound);

const assertRoundQuestionsEditable = async (roundId: string) => {
  const hasAttempts = await AppDataSource.getRepository(
    AssessmentAttempt,
  ).exists({
    where: {
      round: { id: roundId },
    },
  });

  if (hasAttempts) {
    throw new AppError(
      "Questions cannot be changed after a candidate starts this round. Create a new round instead.",
      409,
    );
  }
};
// HR - Create question
export const createQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roundId = String(req.params.roundId);

    const {
      type,
      question,
      options,
      correctAnswer,
      starterCode,
      testCases,
      marks,
      orderNumber,
    } = req.body;

    const round = await roundRepository.findOne({
      where: {
        id: roundId,
      },
    });

    if (!round) {
      throw new AppError("Interview round not found", 404);
    }

    if (round.type === "INTERVIEW") {
      throw new AppError(
        "Questions cannot be added to an interview-only round",
        400,
      );
    }

    await assertRoundQuestionsEditable(roundId);

    const existingQuestion = await questionRepository.findOne({
      where: {
        round: {
          id: roundId,
        },
        orderNumber: orderNumber ?? 1,
      },
    });

    if (existingQuestion) {
      throw new AppError(
        `Question order ${orderNumber ?? 1} already exists in this round`,
        409,
      );
    }

    const newQuestion = questionRepository.create({
      round,
      type,
      question,
      options: type === QuestionType.MCQ ? (options ?? null) : null,
      correctAnswer: type === QuestionType.MCQ ? (correctAnswer ?? null) : null,
      starterCode: type === QuestionType.CODING ? (starterCode ?? null) : null,
      testCases: type === QuestionType.CODING ? (testCases ?? null) : null,
      marks: marks ?? 1,
      orderNumber: orderNumber ?? 1,
    });

    await questionRepository.save(newQuestion);
    getIO().to("hr").emit("hr:updated");

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    next(error);
  }
};

// Get all questions of one round
export const getQuestionsByRound = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roundId = String(req.params.roundId);

    const round = await roundRepository.findOne({
      where: {
        id: roundId,
      },
    });

    if (!round) {
      throw new AppError("Interview round not found", 404);
    }

    const questions = await questionRepository.find({
      where: {
        round: {
          id: roundId,
        },
      },
      order: {
        orderNumber: "ASC",
      },
    });

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

// Get single question
export const getQuestionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = String(req.params.id);

    const question = await questionRepository.findOne({
      where: { id },
      relations: { round: true },
    });

    if (!question) {
      throw new AppError("Question not found", 404);
    }

    return res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    next(error);
  }
};

// HR - Update question
export const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = String(req.params.id);
    const question = await questionRepository.findOne({
      where: { id },
      relations: { round: true },
    });

    if (!question) {
      throw new AppError("Question not found", 404);
    }

    await assertRoundQuestionsEditable(question.round.id);
    // Validate the complete resulting question, including partial updates.
    const parsed = createQuestionSchema.safeParse({
      type: question.type,
      question: question.question,
      marks: question.marks,
      orderNumber: question.orderNumber,
      options: question.options ?? undefined,
      correctAnswer: question.correctAnswer ?? undefined,
      starterCode: question.starterCode ?? undefined,
      testCases: question.testCases ?? undefined,
      ...req.body,
    });

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues.map((issue) => issue.message).join("; "),
        400,
      );
    }

    const data = parsed.data;

    const conflictingQuestion = await questionRepository.findOne({
      where: {
        round: { id: question.round.id },
        orderNumber: data.orderNumber,
      },
    });
    if (conflictingQuestion && conflictingQuestion.id !== question.id) {
      throw new AppError(
        `Question order ${data.orderNumber} already exists in this round`,
        409,
      );
    }

    question.type = data.type;
    question.question = data.question;
    question.marks = data.marks ?? question.marks;
    question.orderNumber = data.orderNumber ?? question.orderNumber;

    question.options = data.type === QuestionType.MCQ ? data.options! : null;

    question.correctAnswer =
      data.type === QuestionType.MCQ ? data.correctAnswer! : null;

    question.starterCode =
      data.type === QuestionType.CODING ? (data.starterCode ?? "") : null;

    question.testCases =
      data.type === QuestionType.CODING ? data.testCases! : null;

    await questionRepository.save(question);
    getIO().to("hr").emit("hr:updated");

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    next(error);
  }
};

// HR - Delete question
export const deleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = String(req.params.id);
    const question = await questionRepository.findOne({
      where: { id, },
      relations:{round:true},
    });

    if (!question) {
      throw new AppError("Question not found", 404);
    }

    await questionRepository.remove(question);
    getIO().to("hr").emit("hr:updated");

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
