import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./components/config/db.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import carRoutes from "./routes/car.route.js";
import rentalRoutes from "./routes/rental.route.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Car Rental Management System API is running",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT 1 AS test");

    res.json({
      message: "Database connected successfully",
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.use("/api/admin", adminRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/rentals", rentalRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
