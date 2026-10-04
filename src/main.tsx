import React from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import PastRuns, { SavedRun } from "./PastRuns";
import BatchScreen from "./BatchScreen";
const savedPage = window.location.pathname === "/saved";
const batchPage = window.location.pathname === "/batch";
import "./style.css";
const url = import.meta.env.VITE_CONVEX_URL;
createRoot(document.getElementById("root")!).render(
  url ? (
    <ConvexProvider client={new ConvexReactClient(url)}>
      <nav className="screen-nav" aria-label="Milestones"><a href="/" aria-current={batchPage || savedPage ? undefined : "page"}>Single-question diagnostic</a><a href="/batch" aria-current={batchPage ? "page" : undefined}>Batch baseline</a></nav>
      {savedPage ? <SavedRun /> : batchPage ? <BatchScreen /> : <><App /><div className="home-history"><PastRuns /></div></>}
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
