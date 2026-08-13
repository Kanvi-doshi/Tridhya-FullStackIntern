import Event from "../models/Event.js";
import User from "../models/User.js";
import { sendEventCreatedEmail } from "./email.service.js";

export const createEvent = async (eventData, userId) => {
  const event = await Event.create({
    ...eventData,
    organizer: userId,
  });
  const user = await User.findById(userId);
  sendEventCreatedEmail(user, event).catch((error) => {
    console.error("Event created:", error);
  });
  return event;
};

export const getAllEvents = async (query) => {
  const filter = {};

  if (query.search) {
    filter.title = {
      $regex: query.search,
      $options: "i",
    };
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.location) {
    filter.location = {
      $regex: `^${query.location}`,
      $options: "i",
    };
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  const sortOptions = {
    date: { date: 1 },
    "-date": { date: -1 },
    title: { title: 1 },
    "-title": { title: -1 },
  };

  const sortOption = sortOptions[query.sort] || { createdAt: -1 };

  const totalEvents = await Event.countDocuments(filter);
  const event = await Event.find(filter)
    .populate("organizer", "name email")
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  return {
    totalEvents,
    currentPage: page,
    totalPages: Math.ceil(totalEvents / limit),
    event,
  };
};

export const getMyEvents = async (userId, query = {}) => {
  const filter = {
    organizer: userId,
  };

  if (query.search) {
    filter.title = {
      $regex: query.search,
      $options: "i",
    };
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.location) {
    filter.location = {
      $regex: `^${query.location}`,
      $options: "i",
    };
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  const sortOptions = {
    date: { date: 1 },
    "-date": { date: -1 },
    title: { title: 1 },
    "-title": { title: -1 },
  };

  const sortOption = sortOptions[query.sort] || { createdAt: -1 };

  const totalEvents = await Event.countDocuments(filter);

  const event = await Event.find(filter)
    .populate("organizer", "name email")
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  return {
    totalEvents,
    currentPage: page,
    totalPages: Math.ceil(totalEvents / limit),
    event,
  };
};
export const getEventById = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate("organizer", "name email")
    .populate("attendees", "name email");

  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }
  return event;
};

export const updateEvent = async (eventId, userId, updates) => {
  const event = await Event.findById(eventId);

  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }

  if (event.organizer.toString() !== userId.toString()) {
    const error = new Error("You are not allowed to update this event");
    error.status = 403;
    throw error;
  }

  const updatedEvent = await Event.findByIdAndUpdate(eventId, updates, {
    new: true,
    runValidators: true,
  });

  return updatedEvent;
};

export const deleteEvent = async (eventId, userId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }

  if (event.organizer.toString() !== userId.toString()) {
    const error = new Error("You are not allowed to delete this event");
    error.status = 403;
    throw error;
  }
  await Event.findByIdAndDelete(eventId);
  return;
};
