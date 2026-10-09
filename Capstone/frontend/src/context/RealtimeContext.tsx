import { createContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import api from "../services/api";
import { useAuth } from "./authContext";

export const HRRealtimeContext = createContext(0);

export function HRRealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!user) return;

    let stopped = false;
    let connecting = false;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const socket = io(import.meta.env.VITE_API_URL ?? "http://localhost:5000", {
      autoConnect: false,
      withCredentials: true,
      transports:["websockets"],
      reconnection: false,
    });

    // Combine events arriving close together into one refresh.
    const refresh = () => {
      clearTimeout(refreshTimer);

      refreshTimer = setTimeout(() => {
        if (!stopped) setRevision((value) => value + 1);
      }, 250);
      console.log("refresh");
    };

    const connect = async () => {
      if (stopped || connecting || socket.connected) return;

      connecting = true;

      try {
        // Reuse Axios authentication/refresh handling.
        await api.get("/auth/me");
        if (stopped) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        socket.auth = { token };
        socket.connect();
        console.log("socket connected");
      } catch (error: unknown) {
        if (
          axios.isAxiosError(error) &&
          [401, 403].includes(error.response?.status ?? 0)
        ) {
          console.log("socket failed", error);
          return;
        }

        console.log("re-connect check failed",error);
        retry();
      } finally {
        connecting = false;
      }
    };

    const retry = () => {
      if (stopped) return;

      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => void connect(), 5000);
    };

    let firstReady = true;
    socket.on("realtime:ready", () => {
      if (firstReady) {
        firstReady = false;
        return;
      }
      refresh();
    });

    socket.on("connect", () => console.log("socket: connected", socket.id));
    socket.on("connect_error", (err) =>
      console.log("socket: connect_error", err.message),
    );
    socket.on("disconnect", (reason) =>
      console.log("socket: disconnected", reason),
    );
    socket.on("hr:updated", refresh);
    socket.on("interviews:updated", refresh);
    socket.on("candidate:updated", refresh);
    socket.on("application:statusChanged", refresh);
    socket.on("notification:new", refresh);
    socket.on("notification:updated", refresh);

    // Already emitted by your assessment controllers.
    socket.on("assessment:started", refresh);
    socket.on("assessment:submitted", refresh);
    socket.on("assessment:evaluated", refresh);
    socket.on("assessment:violation", refresh);

    socket.on("disconnect", retry);
    socket.on("connect_error", retry);

    void connect();

    return () => {
      stopped = true;
      clearTimeout(refreshTimer);
      clearTimeout(retryTimer);
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [user?.id, user?.role]);

  return (
    <HRRealtimeContext.Provider value={revision}>
      {children}
    </HRRealtimeContext.Provider>
  );
}
