import express from "express";

import { protect } from "../components/middleware/auth.middleware.js";
import { authorize } from "../components/middleware/role.middleware.js";

import {
  getCars,
  getAvailable,
  getCar,
  addCar,
  editCar,
  removeCar,
} from "../controller/car.controller.js";

const router = express.Router();

// Anyone logged in can view cars
router.get("/", protect, getCars);

// Customers can see available cars
router.get("/available", protect, getAvailable);

// Anyone logged in can view one car
router.get("/:id", protect, getCar);

// Admin and Staff can add cars
router.post("/", protect, authorize("Admin", "Staff"), addCar);

// Admin and Staff can update cars
router.put("/:id", protect, authorize("Admin", "Staff"), editCar);

// Admin only can delete cars
router.delete("/:id", protect, authorize("Admin"), removeCar);
export default router;
