import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  category: z.string().min(1, "Category is required"),
  image: z.string().optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  rating: z.coerce.number().min(0).max(5).optional(),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .optional(),

  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .optional(),

  price: z.coerce.number().min(0, "Price cannot be negative").optional(),
  category: z.string().min(1, "Category is required").optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  isActive: z.coerce.boolean().optional(),
});