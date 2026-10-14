import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ConvexError } from "convex/values";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { RunLink } from "./RunLink";
import { DAILY_CAP_MESSAGE, indiaDayStart } from "../convex/prospectLimits";
import { tryAnalytics } from "./tryAnalytics";
import SingleResults from "./SingleResults";
import ParticleRing from "./ParticleRing";
import LandingStory from "./LandingStory";
import BatchResults, {BatchMethodology} from "./BatchResults";
import PromptEditor from "./PromptEditor";
import { batchInput } from "../convex/batchEvidence";
function DomainEntry({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let visible = true;
    const update = () => { element.dataset.shine = visible && !document.hidden ? "active" : "paused"; };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  return <div ref={ref} className="domain-entry">{children}</div>;
}
export function FuxiNavigation({ onHome }: { onHome?: () => void }) {
  return <nav className="fuxi-navigation" aria-label="Main"><a className="wordmark" href="/" onClick={onHome ? e => {e.preventDefault(); onHome();} : undefined}><img className="navigation-logo" src="/images/fuxi-logo.png" alt="FUXI" /><span className="alpha-tag">Alpha</span></a><a className="contact-us" href="mailto:getfuxi@fuxi.in">Contact us</a></nav>;
}
function sessionToken(prospect = false) {
  const storageKey = prospect ? "prospect-batch-session" : "batch-session";
  try {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) return saved;
    const token = crypto.randomUUID(); sessionStorage.setItem(storageKey, token); return token;
  } catch { return crypto.randomUUID(); }
}
export { default as BatchResults } from "./BatchResults";
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
  const [leavingHome,setLeavingHome] = useState(false);
  const transitionTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(transitionTimer.current), []);
  const promptInput = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (takeover) promptInput.current?.focus({preventScroll:true}); }, [takeover]);
  const [brandDomain,setBrandDomain] = useState("");
  const [brandLogoAttempt,setBrandLogoAttempt] = useState(0);
  const [brandIcons,setBrandIcons] = useState<string[]>([]);
  const [brandLogoLoading,setBrandLogoLoading] = useState(false);
  const discoverIcons = useAction(api.research.brandIcons);
  useEffect(() => {
    if (!brandDomain) return;
    let active = true;
    setBrandLogoLoading(true); setBrandIcons([]); setBrandLogoAttempt(0);
    void discoverIcons({domain:brandDomain}).then(icons => {
      if (active) { setBrandIcons(icons); setBrandLogoAttempt(0); }
    }).catch(() => {
      if (active) setBrandIcons([`https://${brandDomain}/favicon.ico`]);
    }).finally(() => { if (active) setBrandLogoLoading(false); });
    return () => { active = false; };
  }, [brandDomain,discoverIcons]);
  const [runMode,setRunMode] = useState<"single" | "multiple">(() => {
    try { return sessionStorage.getItem("prospect-run-mode") === "single" ? "single" : "multiple"; } catch { return "multiple"; }
  });
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
  const questions = questionText.split(/\r?\n/).map(q => q.trim()).filter(Boolean);
  const single = questions.length === 1;
  const mode = single ? "single" : "multiple";
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
    try {
      const validated = batchInput(domain, ["Domain validation question"]);
      setBrandDomain(validated.domain); setBrandLogoAttempt(0); setDomainError("");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setTakeover(true); return; }
      setLeavingHome(true);
      transitionTimer.current = window.setTimeout(() => { setTakeover(true); setLeavingHome(false); }, 220);
    }
    catch { setDomainError("Enter a valid website domain."); }
  }
  const validQuestions = questions.length > 0 && questions.length <= 20 && questions.every(q => q.length >= 10 && q.length <= 600);
  return <><ParticleRing /><FuxiNavigation onHome={() => {window.clearTimeout(transitionTimer.current); setLeavingHome(false); setShowResults(false); setTakeover(false);}} /><main className="batch-screen">
    {!showResults && !takeover && <section className={`home-hero${leavingHome ? " home-hero-leaving" : ""}`}>
      <h1>Win BFSI Recommendations in ChatGPT with Ready-to-Publish Content.</h1>
      <p>Benchmark brand visibility, map cited competitors, and instantly generate pre-written content engineered to earn citations.</p>
      <form onSubmit={start} className="domain-form" noValidate>
        <DomainEntry>
          <input id="batch-domain" value={domain} onChange={e => {setDomain(e.target.value); setDomainError("");}} placeholder="Your Website URL" aria-label="Website URL" required disabled={running} autoCapitalize="none" autoCorrect="off" aria-invalid={!!domainError} aria-describedby={domainError ? "domain-status" : undefined} />
          <button className="conversion-button" type="submit" disabled={running || leavingHome || !domain.trim()}>{running ? "Starting…" : "Get Started"}</button>
        </DomainEntry>
        {domainError && <p id="domain-status" role="alert">{domainError}</p>}
      </form>
    </section>}
    {!showResults && !takeover && prospect && <LandingStory leaving={leavingHome} onStart={() => {
      const input = document.getElementById("batch-domain");
      input?.focus({preventScroll:true});
      input?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",block:"center"});
    }} />}
    {!showResults && takeover && <section className="question-takeover" aria-label="Buyer questions">
      <p className="prompt-domain"><span>Domain :</span><span className="prompt-brand-mark">{brandLogoLoading ? <span aria-label="Loading brand logo">…</span> : brandLogoAttempt < brandIcons.length ? <img src={brandIcons[brandLogoAttempt]} alt={`${brandDomain} logo`} onError={() => setBrandLogoAttempt(attempt => attempt + 1)} /> : <span aria-label="Brand logo unavailable">{brandDomain.charAt(0).toUpperCase()}</span>}</span><strong>{brandDomain}</strong></p>
      <form onSubmit={submit} className="batch-form prompt-form">
        <label htmlFor="batch-questions">Enter the prompts</label>
        <PromptEditor value={questionText} onChange={setQuestionText} disabled={!!running} inputRef={promptInput} />
        <p id="question-helper">Use questions relevant to your products, audience and market.</p>
        <p id="prompt-limits" className="subtle">Up to 20 prompts, one per line. 10 to 600 characters per prompt.</p>
        {error && <p className="warning" role="alert">{error}</p>}
        <button className="check-results-button" type="submit" disabled={running || !validQuestions || prospect && (allowance === undefined || allowance.remaining === 0)}>{running ? "Starting…" : "Check Results"}</button>
      </form>
    </section>}
    {prospect && allowance?.remaining === 0 && <p className="warning" role="alert">{DAILY_CAP_MESSAGE}</p>}
    {batch && showResults && <><BatchResults batch={batch} resolveIcons={discoverIcons} showMethodology={false} />{prospect && runMode === "single" && <SingleResults token={token} batch={batch} />}</>}
    {prospect && savedId && showResults && <RunLink id={savedId} />}
    {batch && showResults && <BatchMethodology />}
    <p className="scope-note" aria-label="Sampling note">This baseline uses sampled AI answers. It does not reveal private user queries or an AI system’s hidden retrieval sources. Brand mentions are not endorsements.</p>
  </main></>;
}
