import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import { InterviewAssignment } from "../lib/entity/interviewAssignment";
import { saveInterviewBooking } from "../lib/services/interviewBooking.service";
import { getIO } from "../lib/config/socket";

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

    getIO().to("hr").emit("hr:updated");
    getIO().to("interviewers").emit("interviews:updated");
    getIO().to(`candidate:${assignment.application.candidate.id}`).emit("candidate:updated");

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
    getIO().to("hr").emit("hr:updated");
    getIO().to("interviewers").emit("interviews:updated");
    getIO().to(`candidate:${assignment.application.candidate.id}`).emit("candidate:updated");
    return res.json({
      success: true,
      message: "Interview updated successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
};
