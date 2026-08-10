import {
  getOrganizerDashboard,
  getOrganizerEvents,
} from "../service/organizer.service.js";

// GET /organizer/dashboard
export const organizerDashboard = async (req, res, next) => {
  try {
    const dashboard = await getOrganizerDashboard(req.user._id);

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

// GET /organizer/events
export const organizerEvents = async (req, res, next) => {
  try {
    const events = await getOrganizerEvents(req.user._id);

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};
