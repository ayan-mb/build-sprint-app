import { useEffect, useState, type FormEvent } from "react";
import { ConvexError } from "convex/values";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { batchSummary, citedDomains } from "../convex/batchEvidence";
import type { Batch } from "../convex/batchValidators";
import { RunLink } from "./RunLink";
import { DAILY_CAP_MESSAGE, indiaDayStart } from "../convex/prospectLimits";
import DraftBox from "./DraftBox";
function sessionToken(prospect = false) {
  const storageKey = prospect ? "prospect-batch-session" : "batch-session";
  try {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) return saved;
    const token = crypto.randomUUID(); sessionStorage.setItem(storageKey, token); return token;
  } catch { return crypto.randomUUID(); }
}
export function BatchResults({ batch }: { batch: Batch }) {
  const [draftRows,setDraftRows] = useState<Record<number,string>>({});
  const summary = batch.summary || batchSummary(batch.rows);
  const finished = batch.rows.filter(r => r.status === "complete" || r.status === "error").length;
  return <section className="batch-results" aria-labelledby="batch-results-title">
    <h2 id="batch-results-title">{batch.status === "running" ? "Your batch is running" : "Your batch baseline"}</h2>
    <p role="status" aria-live="polite">{batch.stage} · {finished} of {batch.rows.length} finished</p>
    <progress max={batch.rows.length} value={finished} aria-label="Questions finished" />
    <p><strong>{summary.brand} of {summary.completed} completed answers</strong> name your brand at {batch.domain}. {summary.failed > 0 && `${summary.failed} questions failed; see each error below.`}</p>
    <p className="subtle">Each lender counts once per answer, including negative mentions. Known lender and site aliases are merged in the summary. Source totals count distinct cited links within each answer; search results without citations do not count. Answers without citations still count for brand mentions.</p>
    <div className="batch-summary-columns">
      <section><h3>Other lenders named</h3>{summary.lenders.length ? <ul>{summary.lenders.map(l => <li key={l.name}>{l.name}: <strong>{l.count} answers</strong></li>)}</ul> : <p>No other lenders named in completed answers yet.</p>}</section>
      <section><h3>Most-cited source domains</h3>{summary.domains.length ? <ol>{summary.domains.map(d => <li key={d.domain}>{d.domain}: <strong>{d.count} cited links</strong></li>)}</ol> : <p>No cited sources yet.</p>}</section>
    </div>
    <div className="batch-table-scroll" role="region" aria-label="Question results" tabIndex={0}>
      <table className="batch-table"><caption>One row per borrower question</caption><thead><tr><th scope="col">Question</th><th scope="col">Status</th><th scope="col">Your brand named</th><th scope="col">Other lenders</th><th scope="col">Cited links</th><th scope="col">Source domains</th><th scope="col">Error</th></tr></thead><tbody>
        {batch.rows.map((row,index) => <tr key={index}>
          <th scope="row">{row.question}{row.brandMention === false && <div><button type="button" onClick={() => setDraftRows(previous => previous[index] ? previous : {...previous,[index]:crypto.randomUUID()})}>Write draft</button></div>}</th><td>{row.status === "complete" ? row.answer?.status === "no_citations" ? "Complete · Citation Not Available" : "Complete" : row.status === "error" ? "Failed" : row.status === "running" ? "Running" : "Waiting"}</td>
          <td>{row.brandMention === null ? "Not available" : row.brandMention ? "Yes" : "No"}</td><td>{row.lenders.join(", ") || "—"}</td><td>{citedDomains(row).length}</td><td>{[...new Set(citedDomains(row))].join(", ") || "—"}</td><td>{row.error || "—"}</td>
        </tr>)}
      </tbody></table>
    </div>
    {batch.rows.map((row,index) => draftRows[index] && <DraftBox key={`${batch._id}-${index}`} batchId={batch._id} rowIndex={index} token={draftRows[index]} question={row.question} website={`https://${batch.domain}`} />)}
    <h3>Answers and cited sources</h3>
    {batch.rows.map((row,index) => row.answer && <details key={index} className="batch-answer"><summary>{row.question}</summary><p className="subtle">Model reported: {row.answer.model}</p>{row.answer.message && <p>{row.answer.message}</p>}<p className="answer-text">{row.answer.text}</p>{row.lenderMentions?.length ? <p className="subtle">Lender names counted: {row.lenderMentions.map(m => `${m.canonicalName} (written as “${m.name}”)`).join("; ")}</p> : null}<ul>{row.answer.sources.filter(s => s.cited).map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title || s.url}</a></li>)}</ul></details>)}
  </section>;
}
export default function BatchScreen({ prospect = false, adminToken }: { prospect?: boolean; adminToken?: string }) {
  const [token] = useState(() => sessionToken(prospect));
  const [day,setDay] = useState(() => indiaDayStart(Date.now()));
  useEffect(() => {
    if (!prospect) return;
    const timer = window.setTimeout(() => setDay(indiaDayStart(Date.now())), day + 86400000 - Date.now() + 1000);
    return () => window.clearTimeout(timer);
  }, [prospect,day]);
  const [domain,setDomain] = useState("");
  const [questionText,setQuestionText] = useState("");
  const [error,setError] = useState("");
  const [starting,setStarting] = useState(false);
  const beginAdmin = useMutation(api.batches.begin);
  const beginProspect = useMutation(api.prospectBatches.begin);
  const allowance = useQuery(api.prospectBatches.allowance, prospect ? {day} : "skip");
  const batch = useQuery(api.batches.current, { token });
  const savedId = useQuery(api.prospectBatches.savedLink, prospect && batch && batch.status !== "running" ? {batchId:batch._id,token} : "skip");
  const questions = questionText.split(/\r?\n/).map(q => q.trim()).filter(Boolean);
  const running = starting || batch?.status === "running";
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!questions.length || questions.length > 20) { setError("Enter 1 to 20 questions, one per line. The hard limit is 20."); return; }
    setStarting(true);
    try { if (prospect) await beginProspect({ token,domain,questions }); else await beginAdmin({ token,domain,questions,adminToken }); }
    catch (cause) {
      const message = cause instanceof ConvexError && typeof cause.data === "string" ? cause.data : cause instanceof Error ? cause.message : "";
      const safe = message.match(/(?:Enter a website domain|Use between 1 and 20|Each question must|Wait for your current batch|The hourly batch limit|Use a public website URL|Enter a full public website URL|Today's shared limit|Only \d+ ChatGPT searches remain)[^\n]*/)?.[0];
      setError(safe || "The batch could not start. Check your domain and questions, then try again.");
    } finally { setStarting(false); }
  }
  return <main className="batch-screen">
    <h1>Batch brand baseline</h1>
    <p>See which borrower questions name your NBFC, which other lenders appear, and which websites ChatGPT cites.</p>
    {prospect && allowance?.remaining === 0 && <p className="warning" role="alert">{DAILY_CAP_MESSAGE}</p>}
    <form onSubmit={submit} className="batch-form">
      <label htmlFor="batch-domain">Your NBFC website domain</label><input id="batch-domain" value={domain} onChange={e => setDomain(e.target.value)} placeholder="tatacapital.com" required disabled={running} autoCapitalize="none" autoCorrect="off" />
      <label htmlFor="batch-questions">Borrower questions, one per line</label><textarea id="batch-questions" value={questionText} onChange={e => setQuestionText(e.target.value)} rows={8} required disabled={running} aria-describedby="batch-count" placeholder={"Best personal loans for CIBIL under 700?\nWhat documents are needed for a personal loan?"} />
      <p id="batch-count" className={questions.length > 20 ? "warning" : "subtle"}>{questions.length} of 20 questions. Each question needs 10 to 600 characters.</p>
      {error && <p className="warning" role="alert">{error}</p>}
      <button type="submit" disabled={running || questions.length < 1 || questions.length > 20 || prospect && (allowance === undefined || allowance.remaining === 0)}>{running ? "Batch running…" : "Run batch"}</button>
    </form>
    <p className="subtle">Questions run one at a time on gpt-6.1-sol. A failed question does not stop the rest. This is a baseline from API answers; mentions are not endorsements.</p>
    {prospect && savedId && <RunLink id={savedId} />}
    {batch && <BatchResults batch={batch} />}
  </main>;
}
