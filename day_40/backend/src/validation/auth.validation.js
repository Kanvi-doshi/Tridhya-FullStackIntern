import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .regex(/^[A-Za-z ]+$/, "Name can only contain letters and spaces")
      .max(50, "Name cannot exceed 50 characters"),

    email: z.string().trim().toLowerCase().email("Invalid email address"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password cannot exceed 20 characters"),

    role: z.enum(["user", "organizer", "admin"]).default("user"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),

    password: z.string().min(6, "Password is required"),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name cannot exceed 50 characters")
      .optional(),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address")
      .optional(),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password cannot exceed 20 characters")
      .optional(),
  })
  .strict();
