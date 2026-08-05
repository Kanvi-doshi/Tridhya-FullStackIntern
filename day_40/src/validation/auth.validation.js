import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: z.email("Invalid email address").trim().toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot exceed 20 characters"),

  role: z.enum(["user", "organizer", "admin"]).default("user"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),

  password: z.string().min(6, "Password is required"),
});
