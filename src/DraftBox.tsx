import { useId, useState, type FormEvent } from "react";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import type { DraftResult } from "../convex/draftValidators";
import { copyDraft, downloadDraft } from "./draftExport";
import { RunLink } from "./RunLink";
import { MarkdownArticle } from "./MarkdownArticle";
export function DraftOutput({ draft }: { draft: DraftResult }) {
  const [exportStatus,setExportStatus]=useState("");
  async function copy() {
    try { const format = await copyDraft(draft.text); setExportStatus(format === "rich" ? "Formatted article copied." : "Plain text copied."); }
    catch { setExportStatus("Copy could not access the clipboard. Use Download instead."); }
  }
  function download() {
    try { downloadDraft(draft.text); setExportStatus("Markdown download started."); }
    catch { setExportStatus("Download could not start. Try again or use Copy."); }
  }
  return <div aria-live="polite">
    <p className={draft.status === "unavailable" ? "warning" : "subtle"}>{draft.message}</p>
    {draft.flaggedWords && <p className={draft.flaggedWords.length ? "warning" : "subtle"}>Flagged words: {draft.flaggedWords.join(", ") || "None"}.</p>}
    {draft.verificationNotes && <aside aria-label="Verification notes" className="warning verification-notes"><h4>Verification notes</h4>{draft.verificationNotes.length ? <ul>{draft.verificationNotes.map((note, index) => <li key={index}>{note}</li>)}</ul> : <p>None.</p>}</aside>}
    {draft.savedId && <RunLink id={draft.savedId} />}
    {draft.status === "ready" && <>
      <h4>Your draft page</h4>
      <MarkdownArticle text={draft.text} />
      <div className="draft-export-actions" aria-label="Export draft">
        <button type="button" onClick={copy}>Copy</button>
        <button type="button" onClick={download}>Download Markdown</button>
      </div>
      {exportStatus && <p role="status">{exportStatus}</p>}
      <details><summary>Check every number against the fact sheet</summary>
        {draft.numbers.length ? <ul>{draft.numbers.map((n, i) => <li key={i}><strong>{n.number}</strong> — fact-sheet line {n.sheetLine}<blockquote>{n.passage}</blockquote></li>)}</ul> : <p>No numbers were used in this draft.</p>}
      </details>
    </>}
  </div>;
}
export default function DraftBox({ id, batchId, rowIndex, token, question }: { id?: Id<"diagnostics">; batchId?: Id<"batches">; rowIndex?: number; token: string; question: string; website?: string }) {
  const generate = useAction(api.drafts.generate);
  const formId = useId();
  const [stage, setStage] = useState("");
  const [factSheet, setFactSheet] = useState("");
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setDraft(null);
    try {
      setStage("Reading your brand pages and writing your draft…");
      setDraft(await generate({ id, batchId, rowIndex, token, factSheet }));
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setBusy(false); }
  }
  return <section className="draft-box" aria-labelledby={`${formId}-heading`}>
    <h3 id={`${formId}-heading`}>Write a draft from your product facts</h3>
    <p>Answering: {question}</p>
    <p className="subtle">Paste approved facts for this NBFC product. Cited pages guide the topics. Only your brand’s pages and fact sheet supply facts. Missing facts appear as [VERIFY: …] in Verification notes, outside Copy and Download. The fact sheet is optional. Competitor terms are not used.</p>
    <form onSubmit={submit}>
      <label htmlFor={`${formId}-facts`}>NBFC product fact sheet</label>
      <textarea id={`${formId}-facts`} rows={8} maxLength={50000} disabled={busy} value={factSheet} onChange={e => { setFactSheet(e.target.value); setDraft(null); setError(""); }} placeholder="Paste product eligibility, rates, fees, documents, and conditions. Use one fact per line where possible." />
      <div className="form-actions"><button type="submit" disabled={busy}>{busy ? "Writing draft…" : "Write draft"}</button></div>
    </form>
    {busy && <p role="status">{stage} This may take a few minutes.</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {draft && <DraftOutput draft={draft} />}
  </section>;
}
