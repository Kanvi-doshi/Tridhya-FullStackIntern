import { Request, Response, NextFunction } from "express";

import { AppDataSource } from "../config/db";
import { User } from "../entity/User";
import { verifyAccessToken } from "../services/jwt.services";
import { AppError } from "./error.middleware";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = verifyAccessToken(token);
    } catch {
      throw new AppError("Invalid or expired access token", 401);
    }

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      throw new AppError("User not found", 401);
    }

    if (!user.isActive) {
      throw new AppError("Account is inactive", 403);
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
