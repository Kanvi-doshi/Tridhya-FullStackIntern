import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { HRRealtimeProvider } from "./context/RealtimeContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./component/queryClient";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <HRRealtimeProvider>
            <App />
          </HRRealtimeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
