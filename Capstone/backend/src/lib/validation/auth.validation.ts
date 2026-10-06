import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z.email("Please enter a valid email address"),

  password: z.string().min(6, "Password must contain at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  // Password creation rules belong to registration, not credential checking.
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().pipe(registerSchema.shape.name),
    email: z.string().trim().toLowerCase().pipe(registerSchema.shape.email),
  })
  .strict();
