import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { LanguageProvider } from "./i18n";
import { migrateBusinessProgressV1, migrateLegacyLocalStorage } from "./lib/db";
import { migrateToolLocalStorageOnce } from "./lib/toolStorage";
import { Toaster } from "./components/ui/sonner";
import "./index.css";
import "./styles/toast.css";

migrateLegacyLocalStorage()
  .then(() => migrateBusinessProgressV1())
  .then(() => migrateToolLocalStorageOnce())
  .catch(() => {});

registerSW({ immediate: true });

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
