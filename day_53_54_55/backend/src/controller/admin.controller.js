import {
  getAllUsers,
  getUserById,
  findRoleById,
  updateUserRole,
  deleteUser,
//   findCarByRegistration,
} from "../service/admin.service.js";

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id } = req.body;

    if (!role_id) {
      return res.status(400).json({
        message: "role_id is required",
      });
    }

    // Check if user exists
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if role exists
    const role = await findRoleById(role_id);

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    await updateUserRole(id, role_id);

    res.status(200).json({
      message: "User role updated successfully",
      user_id: Number(id),
      role_id: role.role_id,
      role_name: role.role_name,
    });
  } catch (error) {
    console.error("Change role error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const removeUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await deleteUser(id);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
