// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthContextProvider } from "./contexts/AuthContext";
import { WeatherProvider } from './contexts/WeatherContext';

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthContextProvider>      {/* <-- 1. Auth loads first */}
      <WeatherProvider>        {/* <-- 2. Weather can now see Auth! */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </WeatherProvider>
    </AuthContextProvider>
  </React.StrictMode>
);