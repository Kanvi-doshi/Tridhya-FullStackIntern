import express from "express";

import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} from "../controller/event.controller.js";

import { protect } from "../components/middleware/auth.middleware.js";
import { authorize } from "../components/middleware/role.middleware.js";

import { createEventSchema } from "../validation/event.validation.js";

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;

  next();
};

router.get("/", getEvents);
router.get("/:id", getEvent);

router.post(
  "/",
  protect,
  authorize("organizer", "admin"),
  validate(createEventSchema),
  createEvent,
);
router.put("/:id", protect, authorize("organizer", "admin"), updateEvent);
router.delete("/:id", protect, authorize("organizer", "admin"), deleteEvent);

export default router;
