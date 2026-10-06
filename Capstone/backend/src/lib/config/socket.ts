import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { AppDataSource } from "./db";
import { User, UserRole } from "../entity/User";
import { verifyAccessToken } from "../services/jwt.services";

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (typeof token !== "string") {
        return next(new Error("Authentication required"));
      }

      const decoded = verifyAccessToken(token);

      const user = await AppDataSource.getRepository(User).findOne({
        where: { id: decoded.id },
      });

      if (!user?.isActive || !decoded.exp) {
        return next(new Error("Account unavailable"));
      }

      socket.data.userId = user.id;
      socket.data.role = user.role;
      socket.data.expiresAt = decoded.exp * 1000;

      next();
    } catch {
      next(new Error("Invalid or expired access token"));
    }
  });

  io.on("connection", async (socket) => {
    await socket.join(`user:${socket.data.userId}`);

    if (socket.data.role === UserRole.HR) {
      await socket.join("hr");
    }

    if (socket.data.role === UserRole.CANDIDATE) {
      await socket.join(`candidate:${socket.data.userId}`);
    }

    if (socket.data.role === UserRole.INTERVIEWER) {
      await socket.join("interviewers");
    }

    // The client reloads data after connecting/reconnecting.
    socket.emit("realtime:ready");

    // Require a fresh authenticated connection when this token expires.
    const expiryTimer = setTimeout(
      () => {
        socket.disconnect(true);
      },
      Math.max(0, socket.data.expiresAt - Date.now()),
    );

    socket.on("disconnect", () => {
      clearTimeout(expiryTimer);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }

  return io;
};
