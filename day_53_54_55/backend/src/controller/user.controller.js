import { updateMyProfile } from "../service/user.service.js";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { first_name, last_name, phone } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({
        message: "First name and last name are required",
      });
    }

    await updateMyProfile(userId, {
      first_name,
      last_name,
      phone,
    });

    res.status(200).json({
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
