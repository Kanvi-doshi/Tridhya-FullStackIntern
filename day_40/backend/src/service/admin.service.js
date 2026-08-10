import User from "../models/User.js";
import Event from "../models/Event.js";

export const getAllUsers = async () => {
  const users = await User.find().select("-password");

  return users;
};

export const updateUserRole = async (userId, role) => {
  const allowedRoles = ["user", "organizer", "admin"];

  if (!allowedRoles.includes(role)) {
    const error = new Error("Invalid role");
    error.status = 400;
    throw error;
  }

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  user.role = role;
  await user.save();

  return user;
};

export const deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  await User.findByIdAndDelete(userId);

  return;
};

export const getAllEventsAdmin = async () => {
  const events = await Event.find()
    .populate("organizer", "name email")
    .sort({ createdAt: -1 });

  return events;
};

export const deleteEventAdmin = async (eventId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }

  await Event.findByIdAndDelete(eventId);

  return;
};
