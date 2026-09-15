import { Request, Response, NextFunction } from "express";

import { AppDataSource } from "../lib/config/db";

import { Question, QuestionType } from "../lib/entity/Questions";
import { InterviewRound } from "../lib/entity/InterviewRound";

import { AppError } from "../lib/middleware/error.middleware";

const questionRepository = AppDataSource.getRepository(Question);

const roundRepository = AppDataSource.getRepository(InterviewRound);

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
      where: {
        id,
      },
      relations: {
        round: true,
      },
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
      where: {
        id,
      },
    });
    if (!question) {
      throw new AppError("Question not found", 404);
    }

    const {
      type,
      question: questionText,
      options,
      correctAnswer,
      marks,
      orderNumber,
    } = req.body;

    if (type !== undefined) {
      question.type = type;
    }

    if (questionText !== undefined) {
      question.question = questionText;
    }

    if (options !== undefined) {
      question.options = options;
    }

    if (correctAnswer !== undefined) {
      question.correctAnswer = correctAnswer;
    }

    if (marks !== undefined) {
      question.marks = marks;
    }

    if (orderNumber !== undefined) {
      question.orderNumber = orderNumber;
    }

    await questionRepository.save(question);

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
      where: {
        id,
      },
    });

    if (!question) {
      throw new AppError("Question not found", 404);
    }

    await questionRepository.remove(question);
    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
