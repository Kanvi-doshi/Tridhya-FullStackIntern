import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { AppDataSource } from "../config/db";
import { User } from "../entity/User";
import { AppError } from "./error.middleware";

interface JwtPayload {
  id: string;
  role: string;
}

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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: decoded.id },
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
