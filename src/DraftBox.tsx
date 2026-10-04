import { useState, type FormEvent } from "react";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import type { DraftResult } from "../convex/draftValidators";
import { copyDraft, downloadDraft, type DraftFormat } from "./draftExport";
export function DraftOutput({ draft }: { draft: DraftResult }) {
  const [exportStatus,setExportStatus]=useState("");
  async function copy(format: DraftFormat) {
    try { await copyDraft(draft.text,format); setExportStatus(format==="text" ? "Plain text copied." : "Markdown copied."); }
    catch { setExportStatus("Copy could not access the clipboard. Use Download instead."); }
  }
  function download(format: DraftFormat) {
    try { downloadDraft(draft.text,format); setExportStatus(format==="text" ? "Plain text download started." : "Markdown download started."); }
    catch { setExportStatus("Download could not start. Try again or use Copy."); }
  }
  return <div aria-live="polite">
    <p className={draft.status === "unavailable" ? "warning" : "subtle"}>{draft.message}</p>
    {draft.status === "ready" && <>
      <h4>Your draft page</h4>
      <pre className="draft-text">{draft.text.split(/(\[add:[^\]]+\])/g).map((part, index) => part.startsWith("[add:") ? <mark key={index}>{part}</mark> : part)}</pre>
      <div className="draft-export-actions" aria-label="Export draft">
        <button type="button" onClick={()=>copy("text")}>Copy plain text</button>
        <button type="button" onClick={()=>copy("markdown")}>Copy Markdown</button>
        <button type="button" onClick={()=>download("text")}>Download plain text</button>
        <button type="button" onClick={()=>download("markdown")}>Download Markdown</button>
      </div>
      {exportStatus && <p role="status">{exportStatus}</p>}
      <details><summary>Check every number against the fact sheet</summary>
        {draft.numbers.length ? <ul>{draft.numbers.map((n, i) => <li key={i}><strong>{n.number}</strong> — fact-sheet line {n.sheetLine}<blockquote>{n.passage}</blockquote></li>)}</ul> : <p>No numbers were used in this draft.</p>}
      </details>
    </>}
  </div>;
}
export default function DraftBox({ id, token, question }: { id: Id<"diagnostics">; token: string; question: string }) {
  const generate = useAction(api.drafts.generate);
  const [factSheet, setFactSheet] = useState("");
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setDraft(null);
    try { setDraft(await generate({ id, token, factSheet })); }
    catch { setError("Draft not available. Check that your report is complete, wait a little, and try again. No guessed draft was substituted."); }
    finally { setBusy(false); }
  }
  return <section className="draft-box" aria-labelledby="draft-heading">
    <h3 id="draft-heading">Generate a page from your product facts</h3>
    <p>Answering: {question}</p>
    <p className="subtle">Paste approved facts for this NBFC product. The draft answers your question using only your fact sheet. Missing facts appear as [add: …] placeholders. Competitor terms are not used.</p>
    <form onSubmit={submit}>
      <label htmlFor="fact-sheet">NBFC product fact sheet</label>
      <textarea id="fact-sheet" rows={8} minLength={20} maxLength={50000} required disabled={busy} value={factSheet} onChange={e => { setFactSheet(e.target.value); setDraft(null); setError(""); }} placeholder="Paste product eligibility, rates, fees, documents, and conditions. Use one fact per line where possible." />
      <div className="form-actions"><button type="submit" disabled={busy || factSheet.trim().length < 20}>{busy ? "Generating draft…" : "Generate draft page"}</button></div>
    </form>
    {busy && <p role="status">Checking your fact sheet and assembling one draft. This may take a minute.</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {draft && <DraftOutput draft={draft} />}
  </section>;
}
