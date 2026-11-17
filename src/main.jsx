import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { LanguageProvider } from "./i18n";
import { migrateBusinessProgressV1, migrateLegacyLocalStorage } from "./lib/db";
import { Toaster } from "./components/ui/sonner";
import "./index.css";
import "./styles/toast.css";

migrateLegacyLocalStorage()
  .then(() => migrateBusinessProgressV1())
  .catch(() => {});

// #region agent log
fetch("http://127.0.0.1:7332/ingest/168006ff-69ef-4bfe-b2b4-8a904b363cc9", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c572a0" },
  body: JSON.stringify({
    sessionId: "c572a0",
    runId: "post-fix",
    hypothesisId: "D",
    location: "main.jsx:before-registerSW",
    message: "about to register service worker",
    data: { href: typeof location !== "undefined" ? location.href : null },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    // #region agent log
    fetch("http://127.0.0.1:7332/ingest/168006ff-69ef-4bfe-b2b4-8a904b363cc9", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c572a0" },
      body: JSON.stringify({
        sessionId: "c572a0",
        runId: "post-fix",
        hypothesisId: "D",
        location: "main.jsx:onRegisteredSW",
        message: "service worker registered",
        data: { swUrl, scope: registration?.scope || null },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  },
  onRegisterError(error) {
    // #region agent log
    fetch("http://127.0.0.1:7332/ingest/168006ff-69ef-4bfe-b2b4-8a904b363cc9", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c572a0" },
      body: JSON.stringify({
        sessionId: "c572a0",
        runId: "post-fix",
        hypothesisId: "D",
        location: "main.jsx:onRegisterError",
        message: "service worker register failed",
        data: { error: String(error) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <LanguageProvider>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </LanguageProvider>
    </HelmetProvider>
  </React.StrictMode>
);
