import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css";
import { validateClientEnv } from "./lib/env";

const envReport = validateClientEnv(import.meta.env);

if (envReport.messages.length > 0) {
  envReport.messages.forEach((message) => console.warn(`[Env] ${message}`));
}

if (envReport.requireSupabase && !envReport.isConfigured) {
  throw new Error(
    "Configuracion invalida: activa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY reales o desactiva VITE_REQUIRE_SUPABASE."
  );
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
