import vm from "node:vm";
import { AppDataSource } from "../config/db";
import {
  AssessmentAttempt,
  AssessmentStatus,
} from "../entity/AssessmentAttempt";
import { Answer } from "../entity/Answer";
import { QuestionType } from "../entity/Questions";

const answerRepository = AppDataSource.getRepository(Answer);
// Extract function name from submitted code
const getFunctionName = (code: string): string | null => {
  const match = code.match(/function\s+([a-zA-Z_$][\w$]*)\s*\(/);
  return match ? match[1] : null;
};

// Convert test-case input into function arguments
const parseTestCaseInput = (input: string): any[] => {
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [parsed];
  } catch {
    return [input];
  }
};

const executeJavaScriptTestCase = (answerText: string, input: string) => {
  const fnName = getFunctionName(answerText);

  if (!fnName) {
    throw new Error("Function not found");
  }
  const inputs = parseTestCaseInput(input);
  const context = {
    inputs,
  };
  vm.createContext(context);

  const script = new vm.Script(`
    ${answerText}
    ${fnName}(...inputs);
  `);
  return script.runInContext(context, {
    timeout: 1000,
  });
};

export const evaluateAssessment = async (
  attempt: AssessmentAttempt,
  autoSubmit = false,
) => {
  const answers = await answerRepository.find({
    where: {
      attempt: {
        id: attempt.id,
      },
    },
    relations: {
      question: true,
    },
  });
  let obtainedMarks = 0;
  for (const answer of answers) {
    const question = answer.question;

    if (question.type === QuestionType.MCQ) {
      const isCorrect = answer.answerText === question.correctAnswer;
      answer.isCorrect = isCorrect;
      answer.marksObtained = isCorrect ? question.marks : 0;
      obtainedMarks += Number(answer.marksObtained);
      await answerRepository.save(answer);
      continue;
    }

    if (question.type === QuestionType.CODING) {
      if (!answer.answerText) {
        answer.isCorrect = false;
        answer.marksObtained = 0;
        answer.passedTestCases = 0;
        answer.totalTestCases = question.testCases?.length ?? 0;

        await answerRepository.save(answer);

        continue;
      }

      const testCases = question.testCases ?? [];
      let passedTestCases = 0;

      for (const testCase of testCases) {
        try {
          const actualOutput = executeJavaScriptTestCase(
            answer.answerText,
            testCase.input,
          );

          const actual =
            typeof actualOutput === "object"
              ? JSON.stringify(actualOutput)
              : String(actualOutput);

          const expected = String(testCase.expectedOutput);

          if (actual.trim() === expected.trim()) {
            passedTestCases++;
          }
        } catch (error) {
          console.error(
            `Coding test case failed for question ${question.id}:`,
            error,
          );
        }
      }

      const totalTestCases = testCases.length;

      const marksObtained =
        totalTestCases > 0
          ? (passedTestCases / totalTestCases) * question.marks
          : 0;

      answer.passedTestCases = passedTestCases;
      answer.totalTestCases = totalTestCases;
      answer.marksObtained = Number(marksObtained.toFixed(2));
      answer.isCorrect =
        totalTestCases > 0 && passedTestCases === totalTestCases;
      obtainedMarks += Number(answer.marksObtained);

      await answerRepository.save(answer);

      continue;
    }

    if (question.type === QuestionType.WRITTEN) {
      if (!answer.answerText?.trim()) {
        answer.marksObtained = 0;
        await answerRepository.save(answer);
        continue;
      }
      if (answer.marksObtained !== null) {
        obtainedMarks += Number(answer.marksObtained);
      }

      continue;
    }
  }

  const hasPendingWrittenAnswers = answers.some(
    (answer) =>
      answer.question.type === QuestionType.WRITTEN &&
      answer.answerText?.trim() &&
      answer.marksObtained === null,
  );
  const totalMarks = Number(attempt.totalMarks) || 0;
  const passingScore = Number(attempt.round.passingScore) || 0;

  if (!attempt.submittedAt) {
    attempt.submittedAt = new Date();
  }

  if (autoSubmit) {
    attempt.autoSubmitted = true;
  }
  attempt.obtainedMarks = Number(obtainedMarks.toFixed(2));

  if (hasPendingWrittenAnswers) {
    attempt.score = null;
    attempt.status = AssessmentStatus.PENDING_EVALUATION;

    return {
      obtainedMarks: Number(obtainedMarks.toFixed(2)),
      totalMarks,
      score: null,
      passingScore,
      status: AssessmentStatus.PENDING_EVALUATION,
    };
  }

  const score = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

  attempt.score = Number(score.toFixed(2));
  if (score >= passingScore) {
    attempt.status = AssessmentStatus.PASSED;
  } else {
    attempt.status = AssessmentStatus.FAILED;
  }

  return {
    obtainedMarks: Number(obtainedMarks.toFixed(2)),
    totalMarks,
    score: Number(score.toFixed(2)),
    passingScore,
  };
};
