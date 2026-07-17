import { StrictMode } from "react";
import React from "react";
import ReactDOM from "react-dom/client";
import { createRoot } from "react-dom/client";
import ThemeProvider from "./context/ThemeContext";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
