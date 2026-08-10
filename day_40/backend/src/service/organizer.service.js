import Event from "../models/Event.js";

export const getOrganizerDashboard = async (userId) => {
  const events = await Event.find({ organizer: userId });

  const totalEvents = events.length;

  const today = new Date();

  const upcomingEvents = events.filter(
    (event) => new Date(event.date) >= today,
  ).length;

  const completedEvents = events.filter(
    (event) => new Date(event.date) < today,
  ).length;

  const totalRegistrations = events.reduce(
    (total, event) => total + event.attendees.length,
    0,
  );

  return {
    totalEvents,
    upcomingEvents,
    completedEvents,
    totalRegistrations,
  };
};

export const getOrganizerEvents = async (userId) => {
  const events = await Event.find({ organizer: userId })
    .populate("attendees", "name email")
    .sort({ createdAt: -1 });

    return events;
};
