import React from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { tryAnalytics } from "./tryAnalytics";
import { Routes } from "./Routes";
if (window.location.pathname === "/try") window.history.replaceState(window.history.state, "", "/" + window.location.search + window.location.hash);
import "./style.css";
const url = import.meta.env.VITE_CONVEX_URL;
if (window.location.pathname === "/") void tryAnalytics.init();
createRoot(document.getElementById("root")!).render(
  url ? (
    <ConvexProvider client={new ConvexReactClient(url)}>
      <Routes path={window.location.pathname} />
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
