import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
import "reflect-metadata";
import dotenv from "dotenv";

import http from "http";
import app from "./app";
import { AppDataSource } from "./lib/config/db";
import { initializeSocket } from "./lib/config/socket";
import { startAssessmentExpirationJob } from "./lib/utils/assessmentExpiration";

dotenv.config();
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    for (let i = 0; i < 3; i++) {
      const t = Date.now();
      await AppDataSource.query("SELECT 1");
      console.log("DB round trip:", Date.now() - t, "ms");
    }
    console.log("PostgreSQL connected successfully");

    const server = http.createServer(app);

    initializeSocket(server);
    startAssessmentExpirationJob();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

startServer();
