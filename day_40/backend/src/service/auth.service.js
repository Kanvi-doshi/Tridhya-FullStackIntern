import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateToken } from "../components/utils/jwt.js";
import { sendWelcomeEmail } from "./email.service.js";

export const registerUser = async (userData) => {
  // Check if user already exists
  const existingUser = await User.findOne({
    email: userData.email,
  });

  if (existingUser) {
    const error = new Error("User already exists");
    error.status = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Create user
  const user = await User.create({
    ...userData,
    password: hashedPassword,
  });

  await sendWelcomeEmail(user);
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const loginUser = async ({ email, password }) => {
  // Find user
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  // Compare password
  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  // Generate token
  const token = generateToken({
    id: user._id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return user;
};

export const updateUserProfile = async (userId, updates) => {
  if (updates.email) {
    const existingUser = await User.findOne({
      email: updates.email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      const error = new Error("Email already exists");
      error.status = 409;
      throw error;
    }
  }

  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!updatedUser) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return updatedUser;
};

export const deleteUserProfile = async (userId) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return;
};
