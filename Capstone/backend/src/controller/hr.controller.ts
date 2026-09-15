import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../lib/config/db";
import { User, UserRole } from "../lib/entity/User";
import { AppError } from "../lib/middleware/error.middleware";

const userRepository = AppDataSource.getRepository(User);

export const getCandidates = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const candidates = await userRepository.find({
      where: {
        role: UserRole.CANDIDATE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      order: {
        createdAt: "DESC",
      },
    });

    return res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const interviewers = await userRepository.find({
      where: {
        role: UserRole.INTERVIEWER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      order: {
        createdAt: "DESC",
      },
    });

    return res.status(200).json({
      success: true,
      count: interviewers.length,
      interviewers,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = String(req.params.userId);
    const { role } = req.body;

    if (![UserRole.CANDIDATE, UserRole.INTERVIEWER].includes(role)) {
      throw new AppError("Role must be CANDIDATE or INTERVIEWER", 400);
    }

    const user = await userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role === UserRole.HR) {
      throw new AppError("HR role cannot be changed", 400);
    }

    user.role = role;

    await userRepository.save(user);

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = String(req.params.userId);
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      throw new AppError("isActive must be true or false", 400);
    }

    const user = await userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role === UserRole.HR) {
      throw new AppError("HR account status cannot be changed", 400);
    }

    user.isActive = isActive;

    await userRepository.save(user);

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};
