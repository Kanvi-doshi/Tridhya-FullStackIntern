import express from "express";

import {
  registerEvent,
  unregisterEvent,
  myRegisteredEvents,
  eventAttendees,
  removeAttendee,
} from "../controller/registration.controller.js";

import { protect } from "../components/middleware/auth.middleware.js";
import { authorize } from "../components/middleware/role.middleware.js";

const router = express.Router();

// Register for an event
router.post(
  "/event/:id/register",
  protect,
  authorize("user", "organizer", "admin"),
  registerEvent,
);

// Cancel registration
router.delete(
  "/event/:id/register",
  protect,
  authorize("user", "organizer", "admin"),
  unregisterEvent,
);

// Get logged-in user's registered events
router.get(
  "/users/me/events",
  protect,
  authorize("user", "organizer", "admin"),
  myRegisteredEvents,
);

// Get attendees of an event
router.get(
  "/event/:id/attendees",
  protect,
  authorize("organizer", "admin"),
  eventAttendees,
);

router.delete(
  "/event/:eventId/attendees/:userId",
  protect,
  authorize("organizer", "admin"),
  removeAttendee,
);

export default router;
