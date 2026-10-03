import React from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import "./style.css";
const url = import.meta.env.VITE_CONVEX_URL;
createRoot(document.getElementById("root")!).render(
  url ? (
    <ConvexProvider client={new ConvexReactClient(url)}>
      <App />
    </ConvexProvider>
  ) : (
    <main>
      <h1>Convex connection missing</h1>
      <p>
        Start this app from the project folder with npm run dev. The existing
        Convex URL must be available.
      </p>
    </main>
  ),
);
