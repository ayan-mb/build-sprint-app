import { useId, useState, type FormEvent } from "react";
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import type { DraftResult } from "../convex/draftValidators";
import { tryAnalytics } from "./tryAnalytics";
import { copyDraft, downloadDraft } from "./draftExport";
import { RunLink } from "./RunLink";
import { MarkdownArticle, VerificationText, hasVerification } from "./MarkdownArticle";
export function DraftOutput({ draft }: { draft: DraftResult }) {
  const [text,setText] = useState(draft.text);
  const [notes,setNotes] = useState(draft.verificationNotes || []);
  const blocked = hasVerification(text) || notes.some(hasVerification);
  const [exportStatus,setExportStatus]=useState("");
  async function copy() {
    try { const format = await copyDraft(text); tryAnalytics.track("Draft copied"); setExportStatus(format === "rich" ? "Formatted article copied." : "Plain text copied."); }
    catch { setExportStatus("Copy could not access the clipboard. Use Download instead."); }
  }
  function download() {
    if (blocked) return;
    try { downloadDraft(text); tryAnalytics.track("Draft downloaded"); setExportStatus("Markdown download started."); }
    catch { setExportStatus("Download could not start. Try again or use Copy."); }
  }
  return <div aria-live="polite">
    <p className={draft.status === "unavailable" ? "warning" : "subtle"}>{draft.message}</p>
    {draft.flaggedWords && <p className={draft.flaggedWords.length ? "warning" : "subtle"}>Flagged words: {draft.flaggedWords.join(", ") || "None"}.</p>}
    {draft.verificationNotes && <aside aria-label="Verification notes" className="warning verification-notes"><h4>Verification notes</h4>{notes.length ? <ul>{notes.map((note, index) => <li key={index}><VerificationText text={note} onChange={next => setNotes(previous => previous.map((value, i) => i === index ? next : value))} /></li>)}</ul> : <p>None.</p>}</aside>}
    {draft.savedId && <RunLink id={draft.savedId} />}
    {draft.status === "ready" && <>
      <h4>Your draft page</h4>
      <MarkdownArticle text={text} onChange={setText} />
      <div className="draft-export-actions" aria-label="Export draft">
        <button type="button" onClick={copy}>Copy</button>
        <button type="button" onClick={download} disabled={blocked}>Download</button>
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
      setStage("Preserving your changes… almost there.");
      const result = await generate({ id, batchId, rowIndex, token, factSheet });
      setDraft(result);
      if (result.status === "ready") tryAnalytics.once("Draft written",result.savedId || `${formId}:${Date.now()}`);
    }
    catch { setError("The save hit a temporary snag, but your work didn't go anywhere. Let’s try that one more time."); }
    finally { setBusy(false); }
  }
  return <section className="draft-box" aria-labelledby={`${formId}-heading`}>
    <h3 id={`${formId}-heading`}>Write a draft from your product facts</h3>
    <p>Answering: {question}</p>
    <p className="subtle">Paste approved facts for this NBFC product. Cited pages guide the topics. Only your brand’s pages and fact sheet supply facts. Review and replace every highlighted [VERIFY] tag before download. The fact sheet is optional. Competitor terms are not used.</p>
    <form onSubmit={submit}>
      <label htmlFor={`${formId}-facts`}>NBFC product fact sheet</label>
      <textarea id={`${formId}-facts`} rows={8} maxLength={50000} disabled={busy} value={factSheet} onChange={e => { setFactSheet(e.target.value); setDraft(null); setError(""); }} placeholder="Paste product eligibility, rates, fees, documents, and conditions. Use one fact per line where possible." />
      <div className="form-actions"><button type="submit" disabled={busy}>{busy ? "Preserving your changes… almost there." : "Write Draft"}</button></div>
    </form>
    {busy && <p role="status">{stage}</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {draft && <>{draft.savedId && <p role="status">Draft plan saved.</p>}<DraftOutput draft={draft} /></>}
  </section>;
}
