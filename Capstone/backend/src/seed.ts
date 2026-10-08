import "reflect-metadata";
import bcrypt from "bcryptjs";

import { AppDataSource } from "./lib/config/db";
import { User, UserRole } from "./lib/entity/User";
import { Job, JobStatus } from "./lib/entity/Job";
import { Application, ApplicationStatus } from "./lib/entity/Application";
import { InterviewRound, RoundType } from "./lib/entity/InterviewRound";
import { Question, QuestionType } from "./lib/entity/Questions";
import {
  AssessmentAttempt,
  AssessmentStatus,
} from "./lib/entity/AssessmentAttempt";
import { Answer } from "./lib/entity/Answer";
import {
  InterviewAssignment,
  InterviewAssignmentStatus,
} from "./lib/entity/interviewAssignment";
import {
  InterviewFeedback,
  InterviewRecommendation,
} from "./lib/entity/interviewFeedback";
import { Notification } from "./lib/entity/notification";

const DEMO_PASSWORD = "123456";

async function seed() {
  if (process.env.SEED_DEMO_DATA !== "true") {
    throw new Error(
      'Seeding stopped. Set SEED_DEMO_DATA="true" to confirm you want demo rows added.',
    );
  }

  await AppDataSource.initialize();

  try {
    const users = AppDataSource.getRepository(User);
    const jobs = AppDataSource.getRepository(Job);
    const applications = AppDataSource.getRepository(Application);
    const rounds = AppDataSource.getRepository(InterviewRound);
    const questions = AppDataSource.getRepository(Question);
    const attempts = AppDataSource.getRepository(AssessmentAttempt);
    const answers = AppDataSource.getRepository(Answer);
    const assignments = AppDataSource.getRepository(InterviewAssignment);
    const feedbacks = AppDataSource.getRepository(InterviewFeedback);
    const notifications = AppDataSource.getRepository(Notification);

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    const userFor = async (
      name: string,
      email: string,
      role: UserRole,
    ): Promise<User> => {
      let user = await users.findOneBy({ email });

      if (!user) {
        user = await users.save(
          users.create({
            name,
            email,
            password: passwordHash,
            role,
            isActive: true,
          }),
        );
      }

      return user;
    };

    const hr = await userFor("Demo HR", "hr@gmail.com", UserRole.HR);
    const interviewer = await userFor(
      "Demo Interviewer",
      "interviewer@gmail.com",
      UserRole.INTERVIEWER,
    );

    const candidateUsers = {
      applied: await userFor(
        "Demo Applied Candidate",
        "user_1@gmail.com",
        UserRole.CANDIDATE,
      ),
      shortlisted: await userFor(
        "Demo Shortlisted Candidate",
        "user_2@gmail.com",
        UserRole.CANDIDATE,
      ),
      inProgress: await userFor(
        "Demo In Progress Candidate",
        "user_3@gmail.com",
        UserRole.CANDIDATE,
      ),
      failed: await userFor(
        "Demo Failed Candidate",
        "user_4@gmail.com",
        UserRole.CANDIDATE,
      ),
      pending: await userFor(
        "Demo Pending Evaluation Candidate",
        "user_5@gmail.com",
        UserRole.CANDIDATE,
      ),
      scheduled: await userFor(
        "Demo Interview Candidate",
        "user_6@gmail.com",
        UserRole.CANDIDATE,
      ),
      selected: await userFor(
        "Demo Selected Candidate",
        "user_7@gmail.com",
        UserRole.CANDIDATE,
      ),
    };

    let job = await jobs.findOne({
      where: {
        title: "Demo - Full Stack Developer",
        createdBy: { id: hr.id },
      },
    });

    if (!job) {
      job = await jobs.save(
        jobs.create({
          title: "Demo - Full Stack Developer",
          description:
            "Demo job for testing applications, assessments, and interviews.",
          location: "Ahmedabad",
          experienceRequired: "0-2 years",
          skills: "React, Node.js, TypeScript, PostgreSQL",
          status: JobStatus.OPEN,
          createdBy: hr,
        }),
      );
    }

    const roundFor = async (
      roundNumber: number,
      title: string,
      type: RoundType,
      durationMinutes: number | null,
      passingScore: number | null,
    ): Promise<InterviewRound> => {
      let round = await rounds.findOne({
        where: { job: { id: job.id }, roundNumber },
      });

      if (!round) {
        round = await rounds.save(
          rounds.create({
            job,
            roundNumber,
            title,
            type,
            description: `Demo ${title.toLowerCase()}`,
            durationMinutes,
            passingScore,
            isActive: true,
          }),
        );
      }

      return round;
    };

    const mcqRound = await roundFor(
      1,
      "Round 1 - Node.js Fundamentals",
      RoundType.MCQ,
      30,
      60,
    );
    const codingRound = await roundFor(
      2,
      "Round 2 - Backend Coding",
      RoundType.CODING,
      45,
      60,
    );
    const writtenRound = await roundFor(
      3,
      "Round 3 - Backend Concepts",
      RoundType.WRITTEN,
      30,
      50,
    );
    const interviewRound = await roundFor(
      4,
      "Round 4 - Technical Interview",
      RoundType.INTERVIEW,
      60,
      null,
    );

    const questionFor = async (
      round: InterviewRound,
      type: QuestionType,
      question: string,
      marks: number,
      options: string[] | null = null,
      correctAnswer: string | null = null,
    ): Promise<Question> => {
      let item = await questions.findOne({
        where: { round: { id: round.id }, orderNumber: 1 },
      });

      if (!item) {
        item = await questions.save(
          questions.create({
            round,
            type,
            question,
            marks,
            orderNumber: 1,
            options,
            correctAnswer,
            starterCode: null,
            testCases: null,
          }),
        );
      }

      return item;
    };

    const mcq = await questionFor(
      mcqRound,
      QuestionType.MCQ,
      "Which Node.js module is commonly used to create an HTTP server?",
      2,
      ["fs", "http", "path", "crypto"],
      "http",
    );

    const coding = await questionFor(
      codingRound,
      QuestionType.CODING,
      "Write a JavaScript function named sum that returns the sum of two numbers.",
      5,
    );

    const written = await questionFor(
      writtenRound,
      QuestionType.WRITTEN,
      "Explain the difference between authentication and authorization.",
      5,
    );

    const applicationFor = async (
      candidate: User,
      status: ApplicationStatus,
      currentRound: number,
      overallScore: number | null = null,
    ): Promise<Application> => {
      let application = await applications.findOne({
        where: { candidate: { id: candidate.id }, job: { id: job.id } },
      });

      if (!application) {
        application = await applications.save(
          applications.create({
            candidate,
            job,
            status,
            currentRound,
            overallScore,
          }),
        );
      }

      return application;
    };

    const attemptFor = async (
      application: Application,
      round: InterviewRound,
      status: AssessmentStatus,
      score: number | null,
      totalMarks: number | null,
      obtainedMarks: number | null,
      answerText?: string,
      isCorrect?: boolean | null,
    ): Promise<void> => {
      let attempt = await attempts.findOne({
        where: {
          application: { id: application.id },
          round: { id: round.id },
        },
      });

      if (!attempt) {
        const startedAt = new Date();
        const isSubmitted = status !== AssessmentStatus.IN_PROGRESS;

        attempt = await attempts.save(
          attempts.create({
            application,
            round,
            status,
            score,
            totalMarks,
            obtainedMarks,
            startedAt,
            submittedAt: isSubmitted ? new Date() : null,
            autoSubmitted: false,
            autoSubmitReason: null,
            tabSwitchCount: 0,
            violationCount: 0,
            cameraEnabled: false,
          }),
        );
      }

      if (answerText !== undefined) {
        const question =
          round.roundNumber === 1
            ? mcq
            : round.roundNumber === 2
              ? coding
              : written;

        const existingAnswer = await answers.findOne({
          where: {
            attempt: { id: attempt.id },
            question: { id: question.id },
          },
        });

        if (!existingAnswer) {
          await answers.save(
            answers.create({
              attempt,
              question,
              answerText,
              isCorrect: isCorrect ?? null,
              marksObtained: isCorrect ? question.marks : 0,
              passedTestCases: null,
              totalTestCases: null,
              evaluationFeedback: null,
            }),
          );
        }
      }
    };

    const appliedApp = await applicationFor(
      candidateUsers.applied,
      ApplicationStatus.APPLIED,
      0,
    );

    const shortlistedApp = await applicationFor(
      candidateUsers.shortlisted,
      ApplicationStatus.SHORTLISTED,
      1,
    );

    const inProgressApp = await applicationFor(
      candidateUsers.inProgress,
      ApplicationStatus.SHORTLISTED,
      1,
    );
    await attemptFor(
      inProgressApp,
      mcqRound,
      AssessmentStatus.IN_PROGRESS,
      null,
      2,
      null,
    );

    const failedApp = await applicationFor(
      candidateUsers.failed,
      ApplicationStatus.REJECTED,
      1,
    );
    await attemptFor(
      failedApp,
      mcqRound,
      AssessmentStatus.FAILED,
      0,
      2,
      0,
      "fs",
      false,
    );

    const pendingApp = await applicationFor(
      candidateUsers.pending,
      ApplicationStatus.SHORTLISTED,
      3,
    );
    await attemptFor(
      pendingApp,
      mcqRound,
      AssessmentStatus.PASSED,
      100,
      2,
      2,
      "http",
      true,
    );
    await attemptFor(
      pendingApp,
      codingRound,
      AssessmentStatus.PASSED,
      100,
      5,
      5,
      "function sum(a, b) { return a + b; }",
      true,
    );
    await attemptFor(
      pendingApp,
      writtenRound,
      AssessmentStatus.PENDING_EVALUATION,
      null,
      5,
      null,
      "Authentication verifies identity; authorization determines permitted access.",
    );

    const scheduledApp = await applicationFor(
      candidateUsers.scheduled,
      ApplicationStatus.INTERVIEWING,
      4,
      90,
    );
    const selectedApp = await applicationFor(
      candidateUsers.selected,
      ApplicationStatus.SELECTED,
      4,
      95,
    );

    for (const application of [scheduledApp, selectedApp]) {
      await attemptFor(
        application,
        mcqRound,
        AssessmentStatus.PASSED,
        100,
        2,
        2,
        "http",
        true,
      );
      await attemptFor(
        application,
        codingRound,
        AssessmentStatus.PASSED,
        100,
        5,
        5,
        "function sum(a, b) { return a + b; }",
        true,
      );
      await attemptFor(
        application,
        writtenRound,
        AssessmentStatus.PASSED,
        100,
        5,
        5,
        "Authentication verifies identity; authorization checks permissions.",
        true,
      );
    }

    const assignmentFor = async (
      application: Application,
      status: InterviewAssignmentStatus,
      scheduledAt: Date,
    ): Promise<InterviewAssignment> => {
      let assignment = await assignments.findOne({
        where: {
          application: { id: application.id },
          round: { id: interviewRound.id },
        },
      });

      if (!assignment) {
        const endsAt = new Date(scheduledAt.getTime() + 60 * 60 * 1000);
        assignment = await assignments.save(
          assignments.create({
            application,
            round: interviewRound,
            interviewer,
            scheduledAt,
            endsAt,
            location: "Google Meet: https://meet.google.com/demo-meeting",
            status,
          }),
        );
      }

      return assignment;
    };

    const scheduledAssignment = await assignmentFor(
      scheduledApp,
      InterviewAssignmentStatus.SCHEDULED,
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    );

    const completedAssignment = await assignmentFor(
      selectedApp,
      InterviewAssignmentStatus.COMPLETED,
      new Date(Date.now() - 24 * 60 * 60 * 1000),
    );

    if (
      !(await feedbacks.findOne({
        where: { assignment: { id: completedAssignment.id } },
      }))
    ) {
      await feedbacks.save(
        feedbacks.create({
          assignment: completedAssignment,
          interviewer,
          technicalRating: 5,
          communicationRating: 4,
          problemSolvingRating: 5,
          overallRating: 4.7,
          strengths: "Strong backend fundamentals and clear reasoning.",
          weaknesses: "Could provide more detail on trade-offs.",
          comments: "Good technical interview.",
          recommendation: InterviewRecommendation.STRONGLY_RECOMMEND,
        }),
      );
    }

    const notificationFor = async (
      user: User,
      eventKey: string,
      title: string,
      message: string,
      link: string,
    ) => {
      if (
        !(await notifications.findOne({
          where: { user: { id: user.id }, eventKey },
        }))
      ) {
        await notifications.save(
          notifications.create({
            user,
            eventKey,
            title,
            message,
            link,
            isRead: false,
          }),
        );
      }
    };

    await notificationFor(
      hr,
      "demo-application-applied",
      "New application",
      "A demo candidate applied for Demo - Full Stack Developer.",
      "/hr/applications",
    );
    await notificationFor(
      candidateUsers.shortlisted,
      "demo-shortlisted",
      "You have been shortlisted",
      "You can begin the assessment rounds for the demo job.",
      `/candidate/applications/${shortlistedApp.id}`,
    );
    await notificationFor(
      candidateUsers.scheduled,
      "demo-interview-scheduled",
      "Interview scheduled",
      `Your demo interview is scheduled for ${scheduledAssignment.scheduledAt.toLocaleString()}.`,
      "/candidate/interviews",
    );

    console.log("Demo seed completed. Existing records were left unchanged.");
    console.log(`Demo password for newly created accounts: ${DEMO_PASSWORD}`);
    console.log("HR: hr@gmail.com");
    console.log("Interviewer: interviewer@gmail.com");
    console.log("Candidate accounts use user_1-7");
    console.log("Applied candidate: user_1@gmail.com");
    console.log("In-progress candidate: user_3@gmail.com");
    console.log("Failed candidate: user_4@gmail.com");
    console.log("Pending candidate: user_5@gmail.com");
    console.log("Interview candidate: user_6@gmail.com");
    console.log("Selected candidate: user_7@gmail.com");
    console.log("Shortlisted candidate: user_2@gmail.com");
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((error) => {
  console.error("Demo seed failed:", error);
  process.exitCode = 1;
});
