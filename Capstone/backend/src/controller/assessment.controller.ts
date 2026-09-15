import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import {
  AssessmentAttempt,
  AssessmentStatus,
} from "../lib/entity/AssessmentAttempt";

import { Answer } from "../lib/entity/Answer";
import { Question } from "../lib/entity/Questions";
import { InterviewRound } from "../lib/entity/InterviewRound";
import { Application, ApplicationStatus } from "../lib/entity/Application";
import {
  getAssessmentDeadline,
  getRemainingSeconds,
  isAssessmentExpired,
} from "../lib/utils/assessmentTimer";
import { evaluateAssessment } from "../lib/utils/evaluateAssessment";
import { getIO } from "../lib/config/socket";
import { AppError } from "../lib/middleware/error.middleware";

const attemptRepository = AppDataSource.getRepository(AssessmentAttempt);
const answerRepository = AppDataSource.getRepository(Answer);
const questionRepository = AppDataSource.getRepository(Question);
const roundRepository = AppDataSource.getRepository(InterviewRound);
const applicationRepository = AppDataSource.getRepository(Application);

const autoSubmitIfExpired = async (attempt: AssessmentAttempt) => {
  if (
    attempt.status !== AssessmentStatus.IN_PROGRESS ||
    !isAssessmentExpired(attempt)
  ) {
    return false;
  }

  await evaluateAssessment(attempt, true);
  await attemptRepository.save(attempt);

  getIO().to("hr").emit("assessment:submitted", {
    applicationId: attempt.application?.id,
    attemptId: attempt.id,
    roundId: attempt.round?.id,
    status: attempt.status,
    score: attempt.score,
    autoSubmitted: true,
    submittedAt: attempt.submittedAt,
  });

  return true;
};

export const startAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roundId = String(req.params.roundId);
    const candidateId = req.user!.id;

    const round = await roundRepository.findOne({
      where: { id: roundId },
      relations: { job: true },
    });

    if (!round) {
      throw new AppError("Interview round not found", 404);
    }

    if (!round.isActive) {
      throw new AppError("This interview round is not active", 400);
    }

    const application = await applicationRepository.findOne({
      where: {
        candidate: {
          id: candidateId,
        },
        job: {
          id: round.job.id,
        },
      },
    });

    if (!application) {
      throw new AppError("You have not applied for this job", 404);
    }

    if (
      [ApplicationStatus.REJECTED, ApplicationStatus.SELECTED].includes(
        application.status,
      )
    ) {
      throw new AppError("You cannot start this assessment", 400);
    }

    const existingAttempt = await attemptRepository.findOne({
      where: {
        application: {
          id: application.id,
        },
        round: {
          id: roundId,
        },
      },
    });

    if (existingAttempt) {
      throw new AppError("Assessment already started for this round", 409);
    }

    const questions = await questionRepository.find({
      where: {
        round: {
          id: roundId,
        },
      },
    });

    if (!questions.length) {
      throw new AppError("No questions found for this round", 400);
    }

    const totalMarks = questions.reduce(
      (total, question) => total + question.marks,
      0,
    );

    const attempt = attemptRepository.create({
      application,
      round,
      status: AssessmentStatus.IN_PROGRESS,
      score: null,
      totalMarks,
      obtainedMarks: null,
      startedAt: new Date(),
      submittedAt: null,
      autoSubmitted: false,
    });

    await attemptRepository.save(attempt);

    const deadline = getAssessmentDeadline(attempt);
    const remainingSeconds = getRemainingSeconds(attempt);

    getIO().to("hr").emit("assessment:started", {
      candidateId,
      applicationId: application.id,
      attemptId: attempt.id,
      roundId: round.id,
      roundTitle: round.title,
      jobId: round.job.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
    });

    return res.status(201).json({
      success: true,
      message: "Assessment started successfully",
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        durationMinutes: round.durationMinutes,
        deadline,
        remainingSeconds,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const attemptId = String(req.params.attemptId);
    const candidateId = req.user!.id;
    const attempt = await attemptRepository.findOne({
      where: {
        id: attemptId,
        application: {
          candidate: {
            id: candidateId,
          },
        },
      },
      relations: {
        round: true,
        application: true,
      },
    });

    if (!attempt) {
      throw new AppError("Assessment attempt not found", 404);
    }
    if (await autoSubmitIfExpired(attempt)) {
      return res.status(200).json({
        success: true,
        message: "Assessment time expired and was automatically submitted",
        attempt: {
          id: attempt.id,
          status: attempt.status,
          score: attempt.score,
          autoSubmitted: attempt.autoSubmitted,
          submittedAt: attempt.submittedAt,
        },
      });
    }

    const questions = await questionRepository.find({
      where: {
        round: {
          id: attempt.round.id,
        },
      },
      order: {
        orderNumber: "ASC",
      },
    });

    // Do NOT return correctAnswer/testCases
    const safeQuestions = questions.map(
      ({ id, type, question, options, starterCode, marks, orderNumber }) => ({
        id,
        type,
        question,
        options,
        starterCode,
        marks,
        orderNumber,
      }),
    );

    return res.status(200).json({
      success: true,
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        durationMinutes: attempt.round.durationMinutes,
        deadline: getAssessmentDeadline(attempt),
        remainingSeconds: getRemainingSeconds(attempt),
        totalMarks: attempt.totalMarks,
      },
      questions: safeQuestions,
    });
  } catch (error) {
    next(error);
  }
};

export const saveAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const attemptId = String(req.params.attemptId);
    const candidateId = req.user!.id;
    const { questionId, answerText } = req.body;
    const attempt = await attemptRepository.findOne({
      where: {
        id: attemptId,
        application: {
          candidate: {
            id: candidateId,
          },
        },
      },
      relations: {
        round: true,
        application: true,
      },
    });

    if (!attempt) {
      throw new AppError("Assessment attempt not found", 404);
    }
    if (await autoSubmitIfExpired(attempt)) {
      throw new AppError("Assessment time has expired", 400);
    }
    if (attempt.status !== AssessmentStatus.IN_PROGRESS) {
      throw new AppError("Assessment has already been submitted", 400);
    }

    const question = await questionRepository.findOne({
      where: {
        id: questionId,
        round: {
          id: attempt.round.id,
        },
      },
    });

    if (!question) {
      throw new AppError("Question not found in this assessment", 404);
    }

    let answer = await answerRepository.findOne({
      where: {
        attempt: {
          id: attemptId,
        },
        question: {
          id: questionId,
        },
      },
    });

    if (answer) {
      answer.answerText = answerText ?? null;
    } else {
      answer = answerRepository.create({
        attempt,
        question,
        answerText: answerText ?? null,
        isCorrect: null,
        marksObtained: null,
        passedTestCases: null,
        totalTestCases: null,
      });
    }

    await answerRepository.save(answer);
    return res.status(200).json({
      success: true,
      message: "Answer saved successfully",
      answer: {
        id: answer.id,
        questionId: question.id,
        answerText: answer.answerText,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const attemptId = String(req.params.attemptId);
    const candidateId = req.user!.id;
    const attempt = await attemptRepository.findOne({
      where: {
        id: attemptId,
        application: {
          candidate: {
            id: candidateId,
          },
        },
      },
      relations: {
        round: true,
        application: true,
      },
    });
    if (!attempt) {
      throw new AppError("Assessment attempt not found", 404);
    }
    if (attempt.status !== AssessmentStatus.IN_PROGRESS) {
      throw new AppError("Assessment has already been submitted", 400);
    }

    const autoSubmit = isAssessmentExpired(attempt);
    const result = await evaluateAssessment(attempt, autoSubmit);

    await attemptRepository.save(attempt);

    getIO().to("hr").emit("assessment:submitted", {
      candidateId,
      applicationId: attempt.application.id,
      attemptId: attempt.id,
      roundId: attempt.round.id,
      status: attempt.status,
      score: attempt.score,
      autoSubmitted: attempt.autoSubmitted,
      submittedAt: attempt.submittedAt,
    });

    return res.status(200).json({
      success: true,
      message: autoSubmit
        ? "Time expired. Assessment automatically submitted."
        : "Assessment submitted successfully",
      autoSubmitted: autoSubmit,
      result: {
        ...result,
        status: attempt.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const attemptId = String(req.params.attemptId);
    const candidateId = req.user!.id;
    const attempt = await attemptRepository.findOne({
      where: {
        id: attemptId,
        application: {
          candidate: {
            id: candidateId,
          },
        },
      },
      relations: {
        round: true,
        application: true,
      },
    });

    if (!attempt) {
      throw new AppError("Assessment attempt not found", 404);
    }

    const wasAutoSubmitted = await autoSubmitIfExpired(attempt);
    if (!wasAutoSubmitted && attempt.status === AssessmentStatus.IN_PROGRESS) {
      throw new AppError("Assessment is still in progress", 400);
    }

    const answers = await answerRepository.find({
      where: {
        attempt: {
          id: attemptId,
        },
      },
      relations: {
        question: true,
      },
      order: {
        createdAt: "ASC",
      },
    });

    const safeAnswers = answers.map((answer) => ({
      id: answer.id,
      questionId: answer.question.id,
      question: answer.question.question,
      type: answer.question.type,
      answerText: answer.answerText,
      isCorrect: answer.isCorrect,
      marksObtained: answer.marksObtained,
      passedTestCases: answer.passedTestCases,
      totalTestCases: answer.totalTestCases,
    }));

    return res.status(200).json({
      success: true,
      result: {
        id: attempt.id,
        status: attempt.status,
        totalMarks: attempt.totalMarks,
        obtainedMarks: attempt.obtainedMarks,
        score: attempt.score,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        autoSubmitted: attempt.autoSubmitted,
      },
      answers: safeAnswers,
    });
  } catch (error) {
    next(error);
  }
};
