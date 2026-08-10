import Event from "../models/Event.js";
import { sendEventCreatedEmail } from "./email.service.js";

export const createEvent = async (eventData, userId) => {
  const event = await Event.create({
    ...eventData,
    organizer: userId,
  });

  await sendEventCreatedEmail(user, event);
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
    filter.location = query.location;
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const skip = (page - 1) * limit;

  // let sortOption = { createdAt: -1 };

  // if (query.sort) {
  //   if (query.sort === "date") {
  //     sortOption = { date: 1 };
  //   } else if (query.sort === "-date") {
  //     sortOption = { date: -1 };
  //   } else if (query.sort === "title") {
  //     sortOption = { title: 1 };
  //   } else if (query.sort === "-title") {
  //     sortOption = { title: -1 };
  //   }
  // }

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
