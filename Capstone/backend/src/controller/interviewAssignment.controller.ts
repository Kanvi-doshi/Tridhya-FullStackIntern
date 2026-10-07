import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import {
  InterviewAssignment,
  InterviewAssignmentStatus,
} from "../lib/entity/interviewAssignment";
import { saveInterviewBooking } from "../lib/services/interviewBooking.service";
import { getIO } from "../lib/config/socket";
import { notifyUsers } from "../lib/services/notification.service";

const assignmentRepository = AppDataSource.getRepository(InterviewAssignment);

export const createInterviewAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assignment = await saveInterviewBooking(
      {
        applicationId: String(req.params.applicationId),
        roundId: String(req.params.roundId),
      },
      {
        interviewerId: req.body.interviewerId,
        scheduledAt: req.body.scheduledAt,
        endsAt: req.body.endsAt,
        location: req.body.location,
      },
    );

    const details =
      `Interview for ${assignment.application.job.title}: ${assignment.round.title}. ` +
      `Start: ${new Date(assignment.scheduledAt).toISOString()} (UTC). ` +
      `End: ${
        assignment.endsAt
          ? `${new Date(assignment.endsAt).toISOString()} (UTC)`
          : "Not specified"
      }. ` +
      `Interviewer: ${assignment.interviewer.name}. ` +
      `Location or meeting link: ${assignment.location || "Check your application dashboard."}`;

    void notifyUsers(
      { userIds: [assignment.interviewer.id] },
      {
        eventKey: `interview:${assignment.id}:scheduled:interviewer`,
        title: "Interview assigned to you",
        message: details,
        link: `/interview/${assignment.id}`,
      },
    ).catch((error) =>
      console.error("Interviewer notification failed.", error),
    );

    void notifyUsers(
      { userIds: [assignment.application.candidate.id] },
      {
        eventKey: `interview:${assignment.id}:scheduled:candidate`,
        title: "Interview scheduled",
        message: details,
        link: `/application/${assignment.application.id}`,
      },
      true,
    ).catch((error) =>
      console.error("Candidate interview email failed.", error),
    );

    getIO().to("hr").emit("hr:updated");
    getIO().to("interviewers").emit("interviews:updated");
    getIO()
      .to(`candidate:${assignment.application.candidate.id}`)
      .emit("candidate:updated");

    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAssignedInterviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assignments = await assignmentRepository.find({
      where: { interviewer: { id: req.user!.id } },
      relations: {
        application: {
          candidate: true,
          job: true,
        },
        round: true,
      },
      order: { scheduledAt: "ASC" },
    });

    return res.status(200).json({ success: true, assignments });
  } catch (error) {
    next(error);
  }
};
export const getMyInterviewSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assignments = await assignmentRepository.find({
      where: {
        application: {
          candidate: { id: req.user!.id },
        },
      },
      relations: {
        application: { job: true },
        round: true,
        interviewer: true,
      },
      order: { scheduledAt: "ASC" },
    });

    return res.status(200).json({ success: true, assignments });
  } catch (error) {
    next(error);
  }
};
export const getAllInterviewAssignments = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assignments = await assignmentRepository.find({
      relations: {
        application: {
          candidate: true,
          job: true,
        },
        round: true,
        interviewer: true,
      },
      order: { scheduledAt: "ASC" },
    });
    return res.status(200).json({ success: true, assignments });
  } catch (error) {
    next(error);
  }
};

export const updateInterviewAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assignment = await saveInterviewBooking(
      { assignmentId: String(req.params.id) },
      {
        interviewerId: req.body.interviewerId,
        scheduledAt: req.body.scheduledAt,
        endsAt: req.body.endsAt,
        location: req.body.location,
        status: req.body.status,
      },
    );

    const updatedAt = assignment.scheduledAt.toISOString();
    const cancelled = assignment.status === InterviewAssignmentStatus.CANCELLED;

    const details = cancelled
      ? `The ${assignment.round.title} interview for ${assignment.application.job.title} scheduled at ${new Date(assignment.scheduledAt).toISOString()} (UTC) was cancelled.`
      : `Interview for ${assignment.application.job.title}: ${assignment.round.title}. Start: ${new Date(assignment.scheduledAt).toISOString()} (UTC). End: ${
          assignment.endsAt
            ? `${new Date(assignment.endsAt).toISOString()} (UTC)`
            : "Not specified"
        }. Interviewer: ${assignment.interviewer.name}. Location or meeting link: ${
          assignment.location || "Check your application dashboard."
        }`;

    void notifyUsers(
      { userIds: [assignment.interviewer.id] },
      {
        eventKey: `interview:${assignment.id}:updated:${updatedAt}:interviewer`,
        title: cancelled ? "Interview cancelled" : "Interview schedule updated",
        message: details,
        link: `/interview/${assignment.id}`,
      },
    ).catch((error) =>
      console.error(
        "Interviewer interview update notification failed..",
        error,
      ),
    );

    void notifyUsers(
      { userIds: [assignment.application.candidate.id] },
      {
        eventKey: `interview:${assignment.id}:updated:${updatedAt}:candidate`,
        title: cancelled
          ? "Your interview was cancelled"
          : "Your interview was rescheduled",
        message: details,
        link: `/application/${assignment.application.id}`,
      },
      true,
    ).catch((error) =>
      console.error("Candidate reschedule email failed.", error),
    );

    getIO().to("hr").emit("hr:updated");
    getIO().to("interviewers").emit("interviews:updated");
    getIO()
      .to(`candidate:${assignment.application.candidate.id}`)
      .emit("candidate:updated");
    return res.json({
      success: true,
      message: "Interview updated successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
};
