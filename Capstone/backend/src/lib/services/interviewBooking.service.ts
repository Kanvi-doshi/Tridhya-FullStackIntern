import { AppDataSource } from "../config/db";
import { Application, ApplicationStatus } from "../entity/Application";
import {
  InterviewAssignment,
  InterviewAssignmentStatus,
} from "../entity/interviewAssignment";
import { InterviewRound, RoundType } from "../entity/InterviewRound";
import { User, UserRole } from "../entity/User";
import { AppError } from "../middleware/error.middleware";
import { assertAssessmentsPassed } from "../utils/assertAssessmentsPassed";

interface BookingChanges {
  interviewerId?: string;
  scheduledAt?: string;
  endsAt?: string;
  location?: string;
  status?: InterviewAssignmentStatus;
}

type BookingTarget =
  | { applicationId: string; roundId: string }
  | { assignmentId: string };

export async function saveInterviewBooking(
  target: BookingTarget,
  changes: BookingChanges,
) {
  return AppDataSource.transaction(async (manager) => {
    await manager.query("SELECT pg_advisory_xact_lock(734921)");

    const assignments = manager.getRepository(InterviewAssignment);
    let assignment: InterviewAssignment;
    const isNew = "applicationId" in target;

    if ("assignmentId" in target) {
      const existing = await assignments.findOne({
        where: { id: target.assignmentId },
        relations: {
          application: { job: true, candidate: true },
          round: true,
          interviewer: true,
        },
      });

      if (!existing) {
        throw new AppError("Interview assignment not found", 404);
      }
      assignment = existing;

      if (
        assignment.status === InterviewAssignmentStatus.COMPLETED ||
        assignment.status === InterviewAssignmentStatus.CANCELLED
      ) {
        throw new AppError(
          "Completed or cancelled interviews cannot be edited.",
          400,
        );
      }

      // Cancellation must remain possible even for old incomplete bookings.
      if (changes.status === InterviewAssignmentStatus.CANCELLED) {
        if (
          changes.interviewerId !== undefined ||
          changes.scheduledAt !== undefined ||
          changes.endsAt !== undefined ||
          changes.location !== undefined
        ) {
          throw new AppError(
            "Send cancellation separately from scheduling changes.",
            400,
          );
        }

        assignment.status = InterviewAssignmentStatus.CANCELLED;
        return assignments.save(assignment);
      }
    } else {
      const application = await manager.getRepository(
        Application,
      ).findOne({
        where: { id: target.applicationId },
        relations: { job: true, candidate: true },
      });

      if (!application) {
        throw new AppError("Application not found", 404);
      }

      const round = await manager.getRepository(InterviewRound).findOne({
        where: { id: target.roundId },
        relations: { job: true },
      });

      if (
        !round ||
        !round.isActive ||
        round.type !== RoundType.INTERVIEW ||
        round.job.id !== application.job.id
      ) {
        throw new AppError(
          "Choose an active interview round belonging to this job.",
          400,
        );
      }

      const duplicate = await assignments.findOne({
        where: {
          application: { id: application.id },
          round: { id: round.id },
        },
      });

      if (duplicate) {
        throw new AppError(
          "This application already has an assignment for this round.",
          409,
        );
      }

      assignment = assignments.create({
        application,
        round,
        status: InterviewAssignmentStatus.SCHEDULED,
      });
    }

    const scheduleChanged =
      isNew ||
      changes.interviewerId !== undefined ||
      changes.scheduledAt !== undefined ||
      changes.endsAt !== undefined;

    if (
      !isNew &&
      assignment.status === InterviewAssignmentStatus.IN_PROGRESS &&
      scheduleChanged
    ) {
      throw new AppError(
        "An interview in progress cannot be rescheduled.",
        400,
      );
    }

    if (
      !isNew &&
      assignment.status === InterviewAssignmentStatus.IN_PROGRESS &&
      changes.status === InterviewAssignmentStatus.SCHEDULED
    ) {
      throw new AppError(
        "An interview in progress cannot return to scheduled status.",
        400,
      );
    }

    if (
      scheduleChanged ||
      changes.status === InterviewAssignmentStatus.IN_PROGRESS ||
      changes.status === InterviewAssignmentStatus.COMPLETED
    ) {
      if (assignment.application.status !== ApplicationStatus.INTERVIEWING) {
        throw new AppError(
          "HR must approve this application for interview first.",
          400,
        );
      }

      if (!assignment.round.isActive) {
        throw new AppError("This interview round is inactive.", 400);
      }

      await assertAssessmentsPassed(
        assignment.application.id,
        assignment.application.job.id,
        manager,
      );
    }

    const start =
      changes.scheduledAt !== undefined
        ? new Date(changes.scheduledAt)
        : assignment.scheduledAt;

    const end =
      changes.endsAt !== undefined
        ? new Date(changes.endsAt)
        : assignment.endsAt;

    if (
      !start ||
      !end ||
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      end.getTime() <= start.getTime()
    ) {
      throw new AppError(
        "Provide valid start and end times. End must be after start.",
        400,
      );
    }

    if (scheduleChanged && start.getTime() <= Date.now()) {
      throw new AppError("Choose a future start time.", 400);
    }

    const interviewerId = changes.interviewerId ?? assignment.interviewer?.id;

    if (!interviewerId) {
      throw new AppError("Choose an interviewer.", 400);
    }

    const interviewer = await manager.getRepository(User).findOne({
      where: { id: interviewerId },
    });

    if (!interviewer || interviewer.role !== UserRole.INTERVIEWER) {
      throw new AppError("Choose a valid interviewer.", 400);
    }

    const nextStatus = changes.status ?? assignment.status;
    const occupiesSlot =
      nextStatus === InterviewAssignmentStatus.SCHEDULED ||
      nextStatus === InterviewAssignmentStatus.IN_PROGRESS;

    if ((scheduleChanged || occupiesSlot) && !interviewer.isActive) {
      throw new AppError("This interviewer is inactive.", 400);
    }

    if (occupiesSlot || scheduleChanged) {
      const query = assignments
        .createQueryBuilder("booking")
        .where("booking.interviewer_id = :interviewerId", {
          interviewerId,
        })
        .andWhere("booking.status IN (:...statuses)", {
          statuses: [
            InterviewAssignmentStatus.SCHEDULED,
            InterviewAssignmentStatus.IN_PROGRESS,
          ],
        })
        .andWhere(
          `(
            booking.ends_at IS NULL
            OR (
              booking.scheduled_at < :end
              AND booking.ends_at > :start
            )
          )`,
          { start, end },
        );

      if (!isNew) {
        query.andWhere("booking.id <> :assignmentId", {
          assignmentId: assignment.id,
        });
      }

      const conflict = await query.getOne();
      if (conflict) {
        throw new AppError(
          conflict.endsAt === null
            ? "This interviewer has an active booking without an end time. Update or cancel that booking first."
            : "This interviewer already has an interview during the selected time.",
          409,
        );
      }
    }

    if (
      (nextStatus === InterviewAssignmentStatus.IN_PROGRESS ||
        nextStatus === InterviewAssignmentStatus.COMPLETED) &&
      start.getTime() > Date.now()
    ) {
      throw new AppError(
        "A future interview cannot be marked in progress or completed.",
        400,
      );
    }
    assignment.interviewer = interviewer;
    assignment.scheduledAt = start;
    assignment.endsAt = end;
    assignment.status = nextStatus;

    if (changes.location !== undefined) {
      assignment.location = changes.location;
    }
    return assignments.save(assignment);
  });
}
