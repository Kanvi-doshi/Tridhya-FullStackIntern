import express from "express";
import { register } from "../controller/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Register
router.post("/register", register);

// Login (Coming Next)
// router.post("/login");

router.post("/login", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Login API coming soon",
  });
});

router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default router;
