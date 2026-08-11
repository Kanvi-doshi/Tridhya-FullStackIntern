import Event from "../models/Event.js";
import User from "../models/User.js";
import {
  sendEventRegistrationEmail,
  sendEventCancellationEmail,
} from "./email.service.js";

export const registerForEvent = async (eventId, userId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }

  // Event is cancelled
  if (event.status === "cancelled") {
    const error = new Error("This event has been cancelled");
    error.status = 400;
    throw error;
  }

  // Event capacity reached
  if (event.attendees.length >= event.capacity) {
    const error = new Error("Event is full");
    error.status = 400;
    throw error;
  }

  // User already registered
  const alreadyRegistered = event.attendees.some(
    (attendee) => attendee.toString() === userId.toString(),
  );

  if (alreadyRegistered) {
    const error = new Error("You are already registered for this event");
    error.status = 400;
    throw error;
  }
  event.attendees.push(userId);
  await event.save();

  const user = await User.findById(userId);

  sendEventRegistrationEmail(user, event).catch((error) => {
    console.error("Registration email failed:", error);
  });

  return event;
};

export const cancelRegistration = async (eventId, userId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }

  const isRegistered = event.attendees.some(
    (attendee) => attendee.toString() === userId.toString(),
  );

  if (!isRegistered) {
    const error = new Error("You are not registered for this event");
    error.status = 400;
    throw error;
  }

  event.attendees = event.attendees.filter(
    (attendee) => attendee.toString() !== userId.toString(),
  );

  await event.save();

  const user = await User.findById(userId);
  sendEventCancellationEmail(user, event).catch((error) => {
    console.error("Cancellation email failed:", error);
  });

  return event;
};

// Get logged-in user's registered events
export const getMyEvents = async (userId) => {
  const events = await Event.find({
    attendees: userId,
  })
    .populate("organizer", "name email")
    .sort({ date: 1 });

  return events;
};

// Get attendees of an event
export const getEventAttendees = async (eventId, currentUser) => {
  const event = await Event.findById(eventId).populate(
    "attendees",
    "name email role",
  );

  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }

  const isOwner = event.organizer.toString() === currentUser._id.toString();
  const isAdmin = currentUser.role === "admin";

  if (!isOwner && !isAdmin) {
    const error = new Error("Access denied");
    error.status = 403;
    throw error;
  }

  return event.attendees;
};
