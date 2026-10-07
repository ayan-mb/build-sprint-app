import { useState } from "react";
export function RunLink({ id }: { id: string }) {
  const [status, setStatus] = useState("");
  const path = `/saved?id=${encodeURIComponent(id)}`;
  async function copy() {
    try { await navigator.clipboard.writeText(new URL(path, window.location.origin).href); setStatus("Link copied."); }
    catch { setStatus("Copy could not access the clipboard. Select and copy the link above."); }
  }
  return <div className="run-link" aria-label="This run’s saved link"><p><a href={path}>{path}</a></p><button type="button" onClick={copy}>Copy link</button>{status && <p role="status">{status}</p>}</div>;
}
