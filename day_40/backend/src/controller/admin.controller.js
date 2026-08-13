import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllEventsAdmin,
  deleteEventAdmin,
  getAdminStats,
} from "../service/admin.service.js";

// GET /admin/users
export const allUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /admin/users/:id/role
export const changeUserRole = async (req, res, next) => {
  try {
    const user = await updateUserRole(req.params.id, req.body.role);

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /admin/users/:id
export const removeUser = async (req, res, next) => {
  try {
    await deleteUser(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// GET /admin/events
export const allEvents = async (req, res, next) => {
  try {
    const events = await getAllEventsAdmin();

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /admin/events/:id
export const removeEvent = async (req, res, next) => {
  try {
    await deleteEventAdmin(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const adminStats = async (req, res, next) => {
  try {
    const stats = await getAdminStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
