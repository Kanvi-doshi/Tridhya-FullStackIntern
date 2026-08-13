import {
  registerForEvent,
  cancelRegistration,
  getMyEvents,
  getEventAttendees,
  removeAttendeeFromEvent,
} from "../service/registration.service.js";

// Register for an event
export const registerEvent = async (req, res, next) => {
  try {
    const event = await registerForEvent(req.params.id, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Successfully registered for the event",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel registration
export const unregisterEvent = async (req, res, next) => {
  try {
    const event = await cancelRegistration(req.params.id, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// Get all events registered by the logged-in user
export const myRegisteredEvents = async (req, res, next) => {
  try {
    const events = await getMyEvents(req.user._id);

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// Get attendees of an event
export const eventAttendees = async (req, res, next) => {
  try {
    const attendees = await getEventAttendees(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      count: attendees.length,
      data: attendees,
    });
  } catch (error) {
    next(error);
  }
};
export const removeAttendee = async (req, res, next) => {
  try {
    const event = await removeAttendeeFromEvent(
      req.params.eventId,
      req.params.userId,
      req.user._id,
    );

    return res.status(200).json({
      success: true,
      message: "User removed from event successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};
