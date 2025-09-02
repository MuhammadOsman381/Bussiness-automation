import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster
      position="top-right"
      richColors
      duration={4000}
      closeButton
      visibleToasts={5}
      toastOptions={{
        className:
          "bg-zinc-900 text-white border border-gray-700 shadow-lg rounded-lg px-4 py-2",
        style: {
          fontSize: "0.95rem",
        },
      }}
    />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
