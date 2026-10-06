import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../lib/services/jwt.services";

import { AppDataSource } from "../lib/config/db";
import { User, UserRole } from "../lib/entity/User";
import { AppError } from "../lib/middleware/error.middleware";

const userRepository = AppDataSource.getRepository(User);

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.CANDIDATE,
    });

    await userRepository.save(user);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const user = await userRepository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.email = :email", { email })
      .getOne();

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      throw new AppError("Your account is inactive", 403);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError("Invalid email or password", 401);
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      throw new AppError("Refresh token not found", 401);
    }
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }
    const user = await userRepository.findOne({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      throw new AppError("User not found", 401);
    }
    if (!user.isActive) {
      throw new AppError("Your account is inactive", 403);
    }

    const accessToken = generateAccessToken(user);
    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT ALSO GOES HERE
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email } = req.body;

    const existingUser = await userRepository
      .createQueryBuilder("user")
      .where("LOWER(user.email) = LOWER(:email)", { email })
      .andWhere("user.id <> :id", { id: req.user!.id })
      .getOne();

    if (existingUser) {
      throw new AppError("This email address is already in use.", 409);
    }

    await userRepository.update(req.user!.id, {
      name,
      email,
    });

    const user = await userRepository.findOneBy({
      id: req.user!.id,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return next(new AppError("This email address is already in use.", 409));
    }

    next(error);
  }
};