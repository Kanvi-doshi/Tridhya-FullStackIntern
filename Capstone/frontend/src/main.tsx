import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { HRRealtimeProvider } from "./context/RealtimeContext";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <HRRealtimeProvider>
          <App />
        </HRRealtimeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
