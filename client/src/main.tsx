import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from './App';
import "./index.css";
import "./i18n";
import errorHandler from "./lib/errorHandler";
import { asyncErrorHandler } from "./lib/asyncErrorHandler";
import { initializePromiseHandling } from "./lib/promiseHandler";
import { errorBoundaryHandler } from "./lib/error-boundary-handler";

// Initialize RTL direction based on saved language preference
const savedLang = localStorage.getItem('preferredLanguage') || localStorage.getItem('i18nextLng') || 'en';
document.documentElement.dir = ['ar', 'fa'].includes(savedLang) ? 'rtl' : 'ltr';
document.documentElement.lang = savedLang;

// Initialize comprehensive error handling with proper order
try {
  // Initialize promise handling first to catch early errors
  initializePromiseHandling();
  
  // Then initialize other error handlers
  errorHandler.init();
  asyncErrorHandler.init();
} catch (initError) {
  // Prevent initialization errors from breaking the app
  // Error handler initialization issue
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App/>
  </StrictMode>,
);