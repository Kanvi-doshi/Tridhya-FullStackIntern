import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";

import errorHandler from "./components/middleware/errorHandler.js";
import authRoutes from "./route/auth.route.js";
import eventRoutes from "./route/event.route.js";
import registrationRoutes from "./route/registration.route.js";
import organizerRoutes from "./route/organizer.route.js";
import adminRoutes from "./route/admin.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/", registrationRoutes);
app.use("/event", eventRoutes);
app.use("/organizer", organizerRoutes);
app.use("/admin", adminRoutes);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use(errorHandler);

export default app;
