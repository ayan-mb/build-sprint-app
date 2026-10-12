import { useEffect, useState, type FormEvent } from "react";
import { ConvexError } from "convex/values";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { batchSummary, citedDomains } from "../convex/batchEvidence";
import type { Batch } from "../convex/batchValidators";
import { RunLink } from "./RunLink";
import { DAILY_CAP_MESSAGE, indiaDayStart } from "../convex/prospectLimits";
import { tryAnalytics } from "./tryAnalytics";
import DraftBox from "./DraftBox";
import SingleResults from "./SingleResults";
import ParticleRing from "./ParticleRing";
import { siteIdentity } from "../convex/identities";
import { batchInput } from "../convex/batchEvidence";
export function FuxiNavigation({ onHome }: { onHome?: () => void }) {
  return <nav className="fuxi-navigation" aria-label="Main"><a className="wordmark" href="/try" onClick={onHome ? e => {e.preventDefault(); onHome();} : undefined}><img className="navigation-logo" src="/images/fuxi-logo.png" alt="FUXI" /></a><a className="contact-us" href="mailto:getfuxi@fuxi.in">Contact us</a></nav>;
}
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
  // The stored lender list explicitly excludes the user's brand.
  const brands = summary.lenders.map(l => ({...l, own: false}));
  if (summary.brand) brands.unshift({name: batch.domain, count: summary.brand, own: true});
  const appearances = brands.reduce((total, brand) => total + brand.count, 0);
  const finished = batch.rows.filter(r => r.status === "complete" || r.status === "error").length;
  return <section className="batch-results" aria-labelledby="batch-results-title">
    <h2 id="batch-results-title">{batch.status === "running" ? "Your batch is running" : "Your batch baseline"}</h2>
    <p role="status" aria-live="polite">{batch.stage} · {finished} of {batch.rows.length} finished</p>
    <progress max={batch.rows.length} value={finished} aria-label="Questions finished" />
    <p><strong>{summary.brand} of {summary.completed} completed answers</strong> name your brand at {batch.domain}. {summary.failed > 0 && `${summary.failed} questions failed; see each error below.`}</p>
    <p className="subtle">Each lender counts once per answer, including negative mentions. Known lender and site aliases are merged in the summary. Source totals count distinct cited links within each answer; search results without citations do not count. Answers without citations still count for brand mentions.</p>
    <div className="brand-citations" aria-label="Competition benchmarking">
      {brands.map(brand => {
        const host = brand.own ? batch.domain : summary.domains.find(d => d.domain !== siteIdentity(batch.domain) && d.domain.split(".")[0].length > 3 && !["bank", "www", "finance", "loans"].includes(d.domain.split(".")[0]) && brand.name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(d.domain.split(".")[0]))?.domain.split(" / ")[0];
        const citations = host ? batch.rows.reduce((count, row) => count + citedDomains(row).filter(d => siteIdentity(d) === siteIdentity(host)).length, 0) : null;
        return <section className={`brand-citation ${brand.own ? "own-brand" : ""}`} key={brand.name}>
          {brand.own && <span className="you-tag">You</span>}
          <div className="brand-logo">{host && <img src={`https://${host}/favicon.ico`} alt="" onError={e => {e.currentTarget.hidden = true;}} />}<strong>{brand.name}</strong></div>
          <p><strong>{citations === null ? "Not available" : citations}</strong> citations</p>
          <p><strong>{appearances ? (brand.count / appearances * 100).toFixed(1) : "0.0"}%</strong> share of voice</p>
          <p className="subtle">{brand.count} / {appearances} tracked brand appearances</p>
        </section>;
      })}
    </div>
    <p className="subtle">Tracked brands: {brands.map(b => b.name).join(", ") || "None"}. Share of voice counts each tracked brand once per completed answer, divided by all tracked brand appearances. Appearance rate: {summary.brand} / {summary.completed} completed eligible answers. Citation counts are distinct cited links to the identified brand domain; unavailable means no domain could be identified.</p>
    <section className="cited-domain-list"><h3>Most-cited domains</h3>{summary.domains.length ? <ol>{summary.domains.map(d => <li key={d.domain}><span>{d.domain}</span><strong>{d.count} cited links</strong></li>)}</ol> : <p>No cited sources yet.</p>}</section>
    <p className="subtle">Sample: {batch.domain} · ChatGPT · {batch.rows.find(r => r.answer)?.answer?.model || "gpt-6.1-sol"} · {new Date(batch.createdAt).toLocaleString()} · {summary.completed} / {batch.questions.length} completed. Audience, market and language follow the entered prompts.</p>
    <div className="batch-table-scroll" role="region" aria-label="Question results" tabIndex={0}>
      <table className="batch-table"><caption>One row per buyer question</caption><thead><tr><th scope="col">Question</th><th scope="col">Status</th><th scope="col">Your brand named</th><th scope="col">Other lenders</th><th scope="col">Cited links</th><th scope="col">Source domains</th><th scope="col">Error</th><th scope="col">Write Draft</th></tr></thead><tbody>
        {batch.rows.map((row,index) => <tr key={index}>
          <th scope="row">{row.question}</th><td>{row.status === "complete" ? row.answer?.status === "no_citations" ? "Complete · Citation Not Available" : "Complete" : row.status === "error" ? "Failed" : row.status === "running" ? "Running" : "Waiting"}</td>
          <td>{row.brandMention === null ? "Not available" : row.brandMention ? "Yes" : "No"}</td><td>{row.lenders.join(", ") || "—"}</td><td>{citedDomains(row).length}</td><td>{[...new Set(citedDomains(row))].join(", ") || "—"}</td><td>{row.error || "—"}</td><td>{row.status === "complete" && <button type="button" onClick={() => setDraftRows(previous => previous[index] ? previous : {...previous,[index]:crypto.randomUUID()})}>Write Draft</button>}</td>
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
  const [showResults,setShowResults] = useState(false);
  const [takeover,setTakeover] = useState(false);
  const [domainError,setDomainError] = useState("");
  const [domain,setDomain] = useState("");
  const [questionText,setQuestionText] = useState("");
  const [singleQuestion,setSingleQuestion] = useState("");
  const [mode,setMode] = useState<"single" | "multiple">("multiple");
  const [runMode,setRunMode] = useState<"single" | "multiple">(() => {
    try { return sessionStorage.getItem("prospect-run-mode") === "single" ? "single" : "multiple"; } catch { return "multiple"; }
  });
  const single = mode === "single";
  const [error,setError] = useState("");
  const [starting,setStarting] = useState(false);
  const beginAdmin = useMutation(api.batches.begin);
  const beginProspect = useMutation(api.prospectBatches.begin);
  const beginSingle = useMutation(api.prospectSingle.begin);
  const allowance = useQuery(api.prospectBatches.allowance, prospect ? {day} : "skip");
  const batch = useQuery(api.batches.current, { token });
  useEffect(() => { if (batch) setShowResults(true); }, [batch?._id]);
  const savedId = useQuery(api.prospectBatches.savedLink, prospect && batch && batch.status !== "running" ? {batchId:batch._id,token} : "skip");
  useEffect(() => {
    if (!prospect || !batch) return;
    if (batch.status !== "running") tryAnalytics.batchFinished(batch._id,batch.questions.length,batch.rows.filter(row => row.answer?.status === "ready" || row.answer?.status === "no_citations").length);
  }, [prospect,batch,starting]);
  const questions = single ? (singleQuestion.trim() ? [singleQuestion.trim()] : []) : questionText.split(/\r?\n/).map(q => q.trim()).filter(Boolean);
  const running = starting || batch?.status === "running";
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!questions.length || questions.length > 20) { setError("Enter 1 to 20 questions, one per line. The hard limit is 20."); return; }
    setStarting(true);
    try {
      if (prospect) {
        const id = single ? (await beginSingle({ token,domain,question:questions[0] })).batchId : await beginProspect({ token,domain,questions });
        setShowResults(true);
        setRunMode(mode);
        try { sessionStorage.setItem("prospect-run-mode",mode); } catch {}
        tryAnalytics.batchStarted(id,questions.length,domain,mode);
      } else { await beginAdmin({ token,domain,questions,adminToken }); setShowResults(true); }
    }
    catch (cause) {
      const message = cause instanceof ConvexError && typeof cause.data === "string" ? cause.data : cause instanceof Error ? cause.message : "";
      const safe = message.match(/(?:Enter a website domain|Use between 1 and 20|Each question must|Wait for your current batch|The hourly batch limit|Use a public website URL|Enter a full public website URL|Today's shared limit|Only \d+ ChatGPT searches remain)[^\n]*/)?.[0];
      setError(safe?.includes("shared limit") || safe?.includes("searches remain") ? safe : "We couldn’t start this. Your inputs are still here. Try again.");
    } finally { setStarting(false); }
  }
  function start(event: FormEvent) {
    event.preventDefault();
    try { batchInput(domain, ["Domain validation question"]); setDomainError(""); setTakeover(true); }
    catch { setDomainError("Enter a valid website domain."); }
  }
  const validQuestions = questions.length > 0 && questions.length <= 20 && questions.every(q => q.length >= 10 && q.length <= 600);
  return <><ParticleRing /><FuxiNavigation onHome={() => {setShowResults(false); setTakeover(false);}} /><main className="batch-screen">
    {!showResults && !takeover && <section className="home-hero">
      <h1>When Buyers Ask AI About Finance, Are You in the Answer?</h1>
      <p>Benchmark your financial brand on ChatGPT. See who gets recommended, map the sources shaping the response, and publish content built to be cited.</p>
      <form onSubmit={start} className="domain-form" noValidate>
        <div className="domain-entry">
          <input id="batch-domain" value={domain} onChange={e => {setDomain(e.target.value); setDomainError("");}} placeholder="add your website URL" aria-label="Website URL" required disabled={running} autoCapitalize="none" autoCorrect="off" aria-invalid={!!domainError} aria-describedby="domain-status" />
          <button className="conversion-button" type="submit" disabled={running || !domain.trim()}>{running ? "Starting…" : "Get Started"}</button>
        </div>
        <p id="domain-status" role={domainError ? "alert" : "status"}>{domainError || (!domain.trim() ? "Add your website domain." : "")}</p>
      </form>
    </section>}
    {!showResults && takeover && <section className="question-takeover" aria-label="Buyer questions">
      <h1>Buyer questions, one per line</h1>
      <p>{domain}</p>
      <form onSubmit={submit} className="batch-form">
        <fieldset disabled={running}><legend>Select Single Question or Multiple Question</legend>
          <label className="checkbox"><input type="radio" name="question-mode" checked={single} onChange={() => setMode("single")} />Single Question</label>
          <label className="checkbox"><input type="radio" name="question-mode" checked={!single} onChange={() => setMode("multiple")} />Multiple Question</label>
        </fieldset>
        <label htmlFor="batch-questions">Buyer questions, one per line</label>
        <textarea id="batch-questions" value={single ? singleQuestion : questionText} onChange={e => single ? setSingleQuestion(e.target.value) : setQuestionText(e.target.value)} rows={single ? 3 : 8} required disabled={running} aria-describedby="question-helper batch-count" />
        <p id="question-helper">Use questions relevant to your products, audience and market.</p>
        <p id="batch-count" role="status">{questions.length} prompts added.</p>
        {!questions.length && <p>Add at least one prompt</p>}
        <p className="subtle">{single ? "One question" : "Up to 20 questions"}, 10 to 600 characters per question. ChatGPT · gpt-6.1-sol.</p>
        {error && <p className="warning" role="alert">{error}</p>}
        <button type="submit" disabled={running || !validQuestions || prospect && (allowance === undefined || allowance.remaining === 0)}>{running ? "Starting…" : "Check Results"}</button>
      </form>
    </section>}
    {prospect && allowance?.remaining === 0 && <p className="warning" role="alert">{DAILY_CAP_MESSAGE}</p>}
    <p className="scope-note">This baseline uses sampled AI answers. It does not reveal private user queries or an AI system’s hidden retrieval sources. Brand mentions are not endorsements.</p>
    {batch && showResults && <><BatchResults batch={batch} />{prospect && runMode === "single" && <SingleResults token={token} batch={batch} />}</>}
    {prospect && savedId && showResults && <RunLink id={savedId} />}
  </main></>;
}
