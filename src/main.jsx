import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { LanguageProvider } from "./i18n";
import { migrateLegacyLocalStorage } from "./lib/db";
import { Toaster } from "./components/ui/sonner";
import "./index.css";
import "./styles/toast.css";

migrateLegacyLocalStorage().catch(() => {});

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
