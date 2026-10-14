import { useEffect, useState, type FormEvent } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { RunLink } from "./RunLink";
import RichAnswer from "./RichAnswer";
import DraftBox from "./DraftBox";
import { api } from "../convex/_generated/api";
import type { Answer, Gap, Page } from "../convex/validators";
function makeToken() {
  try {
    const old = sessionStorage.getItem("diagnostic-session");
    if (old) return old;
    const token = crypto.randomUUID();
    sessionStorage.setItem("diagnostic-session", token);
    return token;
  } catch {
    return crypto.randomUUID();
  }
}
export function PageRead({ page }: { page: Page }) {
  return (
    <div className="page-read">
      <p>
        <strong>
          {page.status === "read" ? "Page read" : "Page unavailable"}
        </strong>{" "}
        ·{" "}
        {page.status === "read"
          ? `${page.text.length.toLocaleString()} characters captured`
          : page.message}
      </p>
      <a href={page.finalUrl} target="_blank" rel="noreferrer">
        {page.title || page.finalUrl}
      </a>
      {page.status === "read" && (
        <details>
          <summary>
            View captured page text{page.truncated ? " (shortened)" : ""}
          </summary>
          <p className="captured">{page.text}</p>
        </details>
      )}
    </div>
  );
}
export function ProviderAnswer({ answer }: { answer: Answer }) {
  return (
    <section className="provider">
      <div className="provider-heading">
        <h3>{answer.provider}</h3>
        <span
          className={`badge ${answer.status === "ready" ? "good" : "notice"}`}
        >
          {answer.status === "key_missing"
            ? "Key missing"
            : answer.status === "ready"
              ? "Answer received"
              : answer.status === "no_citations"
                ? "Citation Not Available"
                : "Request failed"}
        </span>
      </div>
      <p className="subtle">
        {answer.model} · {new Date(answer.fetchedAt).toLocaleString()}
      </p>
      {answer.message && (
        <p
          className="provider-message"
          role={answer.status === "key_missing" ? "status" : undefined}
        >
          {answer.message}
        </p>
      )}
      {answer.text && <RichAnswer text={answer.text} />}
      {answer.sources.length > 0 && (
        <>
          <h4>Sources returned</h4>
          <ul className="sources">
            {answer.sources.map((s, i) => (
              <li key={s.url}>
                <span className="source-number">{i + 1}</span>
                <div>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.title}
                  </a>
                  <p className="source-url">{s.url}</p>
                  <span className={`badge ${s.cited ? "good" : "neutral"}`}>
                    {s.cited ? `Cited ${s.reference}` : "Search result only"}
                  </span>{" "}
                  <span className="badge neutral">
                    {s.ownWebsite ? "Your website" : "Other website"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {!answer.sources.length && (
        <p className="subtle">No verified source links returned.</p>
      )}
    </section>
  );
}
export function Finding({ gap }: { gap: Gap }) {
  return (
    <article className="finding">
      <div className="finding-title">
        <h4>{gap.topic}</h4>
        <span className={`badge ${gap.kind === "covered" ? "good" : "notice"}`}>
          {gap.kind === "missing"
            ? "Not found on your page"
            : gap.kind === "covered"
              ? "Topic covered"
              : "Needs review"}
        </span>
      </div>
      <p>{gap.explanation}</p>
      <div className="evidence-columns">
        <div>
          <h5>Cited source evidence</h5>
          <blockquote>{gap.evidence}</blockquote>
          <a href={gap.sourceUrl} target="_blank" rel="noreferrer">
            Open cited page
          </a>
        </div>
        <div>
          <h5>Your page evidence</h5>
          {gap.brandEvidence ? (
            <blockquote>{gap.brandEvidence}</blockquote>
          ) : (
            <p className="subtle">
              No matching passage found in the captured text.
            </p>
          )}
        </div>
      </div>
      <p className="subtle">
        {gap.method === "semantic"
          ? "AI comparison, with quotations checked against the fetched pages"
          : "Topic check using a fixed list of loan concepts"}
      </p>
    </article>
  );
}
export default function App() {
  const [token] = useState(makeToken);
  const current = useQuery(api.diagnostics.current, { token });
  const begin = useMutation(api.diagnostics.begin);
  const configuration = useAction(api.research.configuration);
  const [config, setConfig] = useState<{
    openai: boolean;
  } | null>(null);
  const [configError, setConfigError] = useState("");
  const [question, setQuestion] = useState(
    "Which NBFCs offer personal loans for a CIBIL score under 700, and what are their interest rates and processing fees?",
  );
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [showCovered, setShowCovered] = useState(false);
  useEffect(() => {
    configuration({})
      .then(setConfig)
      .catch(() =>
        setConfigError(
          "Could not check the keys. Check the Convex connection and reload.",
        ),
      );
  }, [configuration]);
  const busy = starting || current?.status === "running";
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setStarting(true);
    try {
      await begin({ question, website, token });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The run could not start. Try again.",
      );
    } finally {
      setStarting(false);
    }
  }
  const result = current?.result;
  const cited =
    result?.answers.filter((a) => a.provider === "ChatGPT").flatMap((a) => a.sources.filter((s) => s.cited)) ?? [];
  const own = cited.filter((s) => s.ownWebsite);
  const gaps =
    result?.gaps.filter((g) => showCovered || g.kind !== "covered") ?? [];
  return (
    <>
      <header>
        <span className="wordmark">FUXI</span>
        <span>Milestone 1 · Citation diagnostic</span>
      </header>
      <main>
        <div className="intro">
          <h1>
            What gets cited.
            <br />
            What your page is missing.
          </h1>
          <p>
            Ask one borrower question. See the ChatGPT answer,
            its cited links, and the content differences on your NBFC’s page.
          </p>
        </div>
        <section className="input-area" aria-labelledby="question-heading">
          <h2 id="question-heading">Run a single-question check</h2>
          <div className="key-status" aria-live="polite">
            {config ? (
              <>
                <span className={`badge ${config.openai ? "good" : "notice"}`}>
                  ChatGPT:{" "}
                  {config.openai
                    ? "key configured"
                    : "key missing — OPENAI_API_KEY"}
                </span>
              </>
            ) : (
              <p>{configError || "Checking provider keys…"}</p>
            )}
          </div>
          {config && !config.openai && (
            <p className="setup-note">
              Add missing keys in your{" "}
              <a
                href="https://dashboard.convex.dev"
                target="_blank"
                rel="noreferrer"
              >
                Convex dashboard
              </a>
              , under Settings → Environment Variables. You can still run the
              page reader. Keys are never entered here.
            </p>
          )}
          <form onSubmit={submit}>
            <label htmlFor="question">Borrower question</label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              minLength={10}
              maxLength={600}
              rows={3}
              required
              disabled={busy}
            />
            <label htmlFor="website">Your NBFC page URL</label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://your-nbfc.com/personal-loan"
              required
              disabled={busy}
            />
            <p className="field-note">
              Use the relevant product page. This check reads that page, not
              your whole website.
            </p>
            <div className="form-actions">
              <button disabled={busy || current === undefined} type="submit">
                {busy ? "Checking sources…" : "Get Started"}
              </button>
              <span className="subtle">
                One question · ChatGPT only · Up to 8 cited pages
              </span>
            </div>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
          </form>
        </section>
        {busy && (
          <div className="run-status" role="status">
            <span className="progress-dot" />
            <div>
              <strong>{current?.stage || "Starting your check"}</strong>
              <p>This can take a few minutes. Results will appear here.</p>
            </div>
          </div>
        )}
        {current?.status === "failed" && (
          <p role="alert" className="error">
            {current.error}
          </p>
        )}
        {current && current.status !== "running" && <RunLink id={current._id} />}
        {result && (
          <section className="results" aria-labelledby="results-heading">
            <h2 id="results-heading">Diagnostic results</h2>
            <p className="run-question">{current.question}</p>
            <p className="subtle">
              Run started {new Date(current.createdAt).toLocaleString()}.
              Results apply to the page text captured at this time.
            </p>
            <section className="brand-section">
              <h3>Your NBFC page</h3>
              <PageRead page={result.brandPage} />
            </section>
            <div className="summary-strip">
              <p>
                <strong>{cited.length}</strong> provider citation links
              </p>
              <p>
                <strong>{own.length}</strong> to your website
              </p>
              <p>
                <strong>
                  {result.gaps.filter((g) => g.kind === "missing").length}
                </strong>{" "}
                findings to review
              </p>
            </div>
            <p className="subtle">
              Citation links are counted per provider, not as share of voice.
              API answers may differ from the consumer ChatGPT
              app.
            </p>
            <div className="answers-grid">
              {result.answers.filter((a) => a.provider === "ChatGPT").map((a) => (
                <ProviderAnswer key={a.provider} answer={a} />
              ))}
            </div>
            <section className="gaps-section">
              <div className="section-heading">
                <h3>What the cited pages cover</h3>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={showCovered}
                    onChange={(e) => setShowCovered(e.target.checked)}
                  />
                  Show topics already covered
                </label>
              </div>
              <p>{result.comparisonStatus}</p>
              <p className="subtle">
                A competitor’s rate or fee is evidence to review, never a claim
                you should copy. This diagnostic cannot prove why a model
                selected a source.
              </p>
              {result.warnings.map((w) => (
                <p key={w} className="warning">
                  {w}
                </p>
              ))}
              {gaps.length ? (
                gaps.map((g, i) => (
                  <Finding key={`${g.sourceUrl}-${g.topic}-${i}`} gap={g} />
                ))
              ) : (
                <div className="empty">
                  <h4>
                    {cited.length
                      ? "No missing topics verified"
                      : "Waiting for cited evidence"}
                  </h4>
                  <p>
                    {cited.length
                      ? "Check the page-reading warnings and enable “Show topics already covered” to review the evidence."
                      : "Connect an available provider key and run this question again. No source-backed gaps have been invented."}
                  </p>
                </div>
              )}
              {result.sourcePages.length > 0 && (
                <details className="source-reading">
                  <summary>
                    Inspect the cited page captures ({result.sourcePages.length}
                    )
                  </summary>
                  {result.sourcePages.map((p) => (
                    <PageRead key={p.url} page={p} />
                  ))}
                </details>
              )}
            </section>
            <DraftBox key={current._id} id={current._id} token={token} question={current.question} />
          </section>
        )}
        <footer>
          FUXI · Milestones 1 and 2: citations, page gaps, and a draft from your product facts.
        </footer>
      </main>
    </>
  );
}
