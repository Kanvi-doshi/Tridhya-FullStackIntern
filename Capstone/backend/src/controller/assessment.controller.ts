import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import {
  AssessmentAttempt,
  AssessmentAutoSubmitReason,
  AssessmentStatus,
} from "../lib/entity/AssessmentAttempt";
import { autoSubmitAssessment } from "../lib/utils/assessmentProctoring";
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
import { updateApplicationRound } from "../lib/utils/updateApplicationRound";
import { getIO } from "../lib/config/socket";
import { AppError } from "../lib/middleware/error.middleware";

const attemptRepository = AppDataSource.getRepository(AssessmentAttempt);
const answerRepository = AppDataSource.getRepository(Answer);
const questionRepository = AppDataSource.getRepository(Question);
const roundRepository = AppDataSource.getRepository(InterviewRound);
const applicationRepository = AppDataSource.getRepository(Application);

const assertRoundUnlocked = async (applicationId: string, roundId: string) => {
  const application = await applicationRepository.findOne({
    where: { id: applicationId },
    relations: { job: true },
  });

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  if (application.status !== ApplicationStatus.SHORTLISTED) {
    throw new AppError(
      application.status === ApplicationStatus.APPLIED
        ? "HR must shortlist your application before you can start assessments."
        : "Assessments are unavailable for this application status.",
      403,
    );
  }

  const rounds = await roundRepository.find({
    where: {
      job: { id: application.job.id },
      isActive: true,
    },
    order: { roundNumber: "ASC" },
  });

  const currentRound = rounds.find((round) => round.id === roundId);

  if (!currentRound || currentRound.type === "INTERVIEW") {
    throw new AppError("Assessment round is unavailable", 403);
  }

  const attempts = await attemptRepository.find({
    where: {
      application: { id: applicationId },
    },
    relations: { round: true },
  });

  const earlierRounds = rounds.filter(
    (round) => round.roundNumber < currentRound.roundNumber,
  );

  for (const previousRound of earlierRounds) {
    if (previousRound.type === "INTERVIEW") {
      throw new AppError(
        "This assessment is locked pending interview-round approval",
        403,
      );
    }

    const previousAttempt = attempts.find(
      (attempt) => attempt.round.id === previousRound.id,
    );

    if (previousAttempt?.status !== AssessmentStatus.PASSED) {
      throw new AppError(
        `This assessment is locked. Round ${previousRound.roundNumber} must be passed first.`,
        403,
      );
    }
  }
};

const autoSubmitIfExpired = async (attempt: AssessmentAttempt) => {
  if (
    attempt.status !== AssessmentStatus.IN_PROGRESS ||
    !isAssessmentExpired(attempt)
  ) {
    return false;
  }

  const submitted = await autoSubmitAssessment(
    attempt,
    AssessmentAutoSubmitReason.TIME_EXPIRED,
  );

  if (!submitted) {
    return false;
  }

  getIO().to("hr").emit("assessment:submitted", {
    applicationId: attempt.application?.id,
    attemptId: attempt.id,
    roundId: attempt.round?.id,
    status: attempt.status,
    score: attempt.score,
    autoSubmitted: true,
    autoSubmitReason: attempt.autoSubmitReason,
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

    if (
      existingAttempt &&
      existingAttempt.status !== AssessmentStatus.IN_PROGRESS
    ) {
      return res.status(200).json({
        success: true,
        message: "Assessment already submitted",
        attempt: {
          id: existingAttempt.id,
          status: existingAttempt.status,
        },
      });
    }

    // Validate both new attempts and attempts being resumed.
    await assertRoundUnlocked(application.id, round.id);

    if (existingAttempt) {
      return res.status(200).json({
        success: true,
        message: "Resume existing assessment",
        attempt: {
          id: existingAttempt.id,
          status: existingAttempt.status,
        },
      });
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
      autoSubmitReason: null,
      tabSwitchCount: 0,
      violationCount: 0,
      cameraEnabled: false,
    });

    await attemptRepository.save(attempt);

    const deadline = getAssessmentDeadline(attempt);
    const remainingSeconds = getRemainingSeconds(attempt);

    getIO()
      .to("hr")
      .to(`candidate:${req.user!.id}`)
      .emit("assessment:started", {
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

    if (attempt.status === AssessmentStatus.IN_PROGRESS) {
      await assertRoundUnlocked(attempt.application.id, attempt.round.id);
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

    const savedAnswers = await answerRepository.find({
      where: {
        attempt: {
          id: attempt.id,
        },
      },
      relations: {
        question: true,
      },
    });
    return res.status(200).json({
      success: true,
      serverNow: new Date().toISOString(),
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        durationMinutes: attempt.round.durationMinutes,
        deadline: getAssessmentDeadline(attempt),
        remainingSeconds: getRemainingSeconds(attempt),
        totalMarks: attempt.totalMarks,
        tabSwitchCount: attempt.tabSwitchCount,
        violationCount: attempt.violationCount,
      },
      questions: safeQuestions,
      answers: savedAnswers.map((answer) => ({
        questionId: answer.question.id,
        answerText: answer.answerText ?? "",
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttemptsByJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const jobId = String(req.params.jobId);
    const attempts = await attemptRepository.find({
      where: {
        application: {
          candidate: { id: req.user!.id },
          job: { id: jobId },
        },
      },
      relations: {
        round: true,
      },
    });
    return res.status(200).json({
      success: true,
      attempts: attempts.map((attempt) => ({
        id: attempt.id,
        roundId: attempt.round.id,
        status: attempt.status,
      })),
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
    if (isAssessmentExpired(attempt)) {
      await autoSubmitAssessment(
        attempt,
        AssessmentAutoSubmitReason.TIME_EXPIRED,
      );

      getIO().to("hr").emit("assessment:submitted", {
        candidateId,
        applicationId: attempt.application.id,
        attemptId: attempt.id,
        roundId: attempt.round.id,
        status: attempt.status,
        score: attempt.score,
        autoSubmitted: attempt.autoSubmitted,
        autoSubmitReason: attempt.autoSubmitReason,
        submittedAt: attempt.submittedAt,
      });

      return res.status(200).json({
        success: true,
        message: "Time expired. Assessment automatically submitted.",
        autoSubmitted: true,
        result: {
          status: attempt.status,
          score: attempt.score,
          obtainedMarks: attempt.obtainedMarks,
          totalMarks: attempt.totalMarks,
          autoSubmitReason: attempt.autoSubmitReason,
          submittedAt: attempt.submittedAt,
        },
      });
    }

    const result = await evaluateAssessment(attempt, false);

    await attemptRepository.save(attempt);
    await updateApplicationRound(attempt);

    getIO().to("hr").emit("assessment:submitted", {
      candidateId,
      applicationId: attempt.application.id,
      attemptId: attempt.id,
      roundId: attempt.round.id,
      status: attempt.status,
      score: attempt.score,
      autoSubmitted: attempt.autoSubmitted,
      autoSubmitReason: null,
      submittedAt: attempt.submittedAt,
    });

    return res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      autoSubmitted: false,
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
        autoSubmitReason: attempt.autoSubmitReason,
        violationCount: attempt.violationCount,
        tabSwitchCount: attempt.tabSwitchCount,
      },
      answers: safeAnswers,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCameraStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const attemptId = String(req.params.attemptId);
    const candidateId = req.user!.id;
    const { enabled } = req.body;
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
        application: true,
        round: true,
      },
    });

    if (!attempt) {
      throw new AppError("Assessment attempt not found", 404);
    }

    if (attempt.status !== AssessmentStatus.IN_PROGRESS) {
      throw new AppError("Assessment is no longer in progress", 400);
    }

    if (await autoSubmitIfExpired(attempt)) {
      throw new AppError("Assessment time has expired", 400);
    }

    attempt.cameraEnabled = enabled;

    await attemptRepository.save(attempt);
    return res.status(200).json({
      success: true,
      message: enabled
        ? "Camera enabled successfully"
        : "Camera status updated",

      cameraEnabled: attempt.cameraEnabled,
    });
  } catch (error) {
    next(error);
  }
};

export const reportAssessmentViolation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const attemptId = String(req.params.attemptId);
    const candidateId = req.user!.id;
    const { type } = req.body;
    let attempt = await attemptRepository.findOne({
      where: {
        id: attemptId,

        application: {
          candidate: {
            id: candidateId,
          },
        },
      },

      relations: {
        application: true,
        round: true,
      },
    });

    if (!attempt) {
      throw new AppError("Assessment attempt not found", 404);
    }

    if (attempt.status !== AssessmentStatus.IN_PROGRESS) {
      return res.status(200).json({
        success: true,
        message: "Assessment has already been submitted",
        submitted: true,
        status: attempt.status,
        autoSubmitReason: attempt.autoSubmitReason,
      });
    }

    if (await autoSubmitIfExpired(attempt)) {
      return res.status(200).json({
        success: true,
        message: "Assessment time expired and was automatically submitted",
        submitted: true,
        status: attempt.status,
        autoSubmitReason: attempt.autoSubmitReason,
      });
    }

    let reason: AssessmentAutoSubmitReason;
    if (type === "TAB_SWITCH") {
      const count = Number(req.body.tabSwitchCount);

      await attemptRepository
        .createQueryBuilder()
        .update(AssessmentAttempt)
        .set({
          tabSwitchCount: () => 'GREATEST("tab_switch_count", :count)',
          violationCount: () =>
            '"violation_count" + GREATEST(0, :count - "tab_switch_count")',
        })
        .where("id = :id", { id: attempt.id })
        .andWhere("status = :status", {
          status: AssessmentStatus.IN_PROGRESS,
        })
        .setParameter("count", count)
        .execute();

      // Read the saved count instead of relying on the earlier object.
      attempt = await attemptRepository.findOne({
        where: {
          id: attemptId,
          application: {
            candidate: { id: candidateId },
          },
        },
        relations: {
          application: true,
          round: true,
        },
      });

      if (!attempt) {
        throw new AppError("Assessment attempt not found", 404);
      }

      if (attempt.status !== AssessmentStatus.IN_PROGRESS) {
        return res.json({
          success: true,
          submitted: true,
          status: attempt.status,
        });
      }
      reason = AssessmentAutoSubmitReason.TAB_SWITCH;
    } else if (type === "CAMERA_DISABLED") {
      attempt.violationCount += 1;
      attempt.cameraEnabled = false;

      await attemptRepository.save(attempt);
      reason = AssessmentAutoSubmitReason.CAMERA_VIOLATION;
    } else {
      throw new AppError("Invalid assessment violation", 400);
    }

    if (type === "TAB_SWITCH" && attempt.tabSwitchCount < 3) {
      getIO().to("hr").emit("assessment:violation", {
        candidateId,
        applicationId: attempt.application.id,
        attemptId: attempt.id,
        roundId: attempt.round.id,
        violationType: type,
        violationCount: attempt.violationCount,
        tabSwitchCount: attempt.tabSwitchCount,
        autoSubmitted: attempt.autoSubmitted,
        autoSubmitReason: attempt.autoSubmitReason,
        status: attempt.status,
        score: attempt.score,
        submittedAt: attempt.submittedAt,
      });

      return res.json({
        success: true,
        submitted: false,
        message:
          `Warning ${attempt.tabSwitchCount}/3: ` +
          "Stay on the assessment tab. The third tab switch will automatically submit your assessment.",
        violation: {
          type,
          violationCount: attempt.violationCount,
          tabSwitchCount: attempt.tabSwitchCount,
        },
      });
    }

    await autoSubmitAssessment(attempt, reason);

    getIO().to("hr").emit("assessment:submitted", {
      candidateId,
      applicationId: attempt.application.id,
      attemptId: attempt.id,
      roundId: attempt.round.id,
      violationType: type,
      violationCount: attempt.violationCount,
      tabSwitchCount: attempt.tabSwitchCount,
      status: attempt.status,
      score: attempt.score,
      autoSubmitted: attempt.autoSubmitted,
      autoSubmitReason: attempt.autoSubmitReason,
      submittedAt: attempt.submittedAt,
    });

    return res.status(200).json({
      success: true,
      message:
        type === "TAB_SWITCH"
          ? "Tab switch detected. Assessment automatically submitted."
          : "Camera violation detected. Assessment automatically submitted.",

      submitted: true,
      violation: {
        type,
        violationCount: attempt.violationCount,
        tabSwitchCount: attempt.tabSwitchCount,
      },

      result: {
        status: attempt.status,
        score: attempt.score,
        obtainedMarks: attempt.obtainedMarks,
        totalMarks: attempt.totalMarks,
        autoSubmitted: attempt.autoSubmitted,
        autoSubmitReason: attempt.autoSubmitReason,
        submittedAt: attempt.submittedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
