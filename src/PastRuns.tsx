import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { PageRead, ProviderAnswer, Finding } from "./App";
import { BatchResults } from "./BatchScreen";
import { DraftOutput } from "./DraftBox";
export const savedDate = (date: number) => new Date(date).toISOString();
export default function PastRuns({ adminToken }: { adminToken: string }) {
  const {results,status,loadMore}=usePaginatedQuery(api.history.list,{adminToken}, {initialNumItems:20});
  return <section className="past-runs" aria-labelledby="past-runs-heading">
    <h2 id="past-runs-heading">Past runs</h2>
    <p className="subtle">Saved in Convex with their dates. Admin access is required to browse this history.</p>
    {status === "LoadingFirstPage" ? <p role="status">Loading saved runs…</p> : results.length ? <ul>{results.map(entry=><li key={entry._id}>
      <a href={`/saved?id=${entry._id}`}>{entry.title}</a>
      <span className="subtle"> · <time dateTime={savedDate(entry.createdAt)}>{new Date(entry.createdAt).toLocaleString()}</time> · {entry.status}</span>
    </li>)}</ul> : <p>No saved runs or drafts yet.</p>}
    {status === "CanLoadMore" && <button type="button" onClick={()=>loadMore(20)}>Show older runs</button>}
    {status === "LoadingMore" && <p role="status">Loading older runs…</p>}
  </section>;
}
export function SavedRun() {
  const raw=new URLSearchParams(window.location.search).get("id");
  const id=raw && /^[a-z0-9]{20,40}$/.test(raw) ? raw as Id<"history"> : null;
  const resolved=useQuery(api.prospect.resolveSaved, id ? {id} : "skip");
  const saved=useQuery(api.history.read,resolved?.historyId ? {id:resolved.historyId} : "skip");
  const diagnostic=resolved?.diagnostic;
  const directDraft=resolved?.draft;
  return <main className="saved-run"><h1>Saved result</h1>
    {!id || resolved && !resolved.historyId && !diagnostic && !directDraft || saved===null ? <p role="alert">This saved run could not be found. Check the saved link and try again.</p> : resolved===undefined || resolved.historyId && saved===undefined ? <p role="status">Loading saved result…</p> : <>
      {diagnostic && <section><h2>{diagnostic.question}</h2><p>{diagnostic.stage}</p>{diagnostic.error && <p role="alert">{diagnostic.error}</p>}{diagnostic.result && <><PageRead page={diagnostic.result.brandPage} />{diagnostic.result.answers.map(answer => <ProviderAnswer key={answer.provider} answer={answer} />)}<p>{diagnostic.result.comparisonStatus}</p>{diagnostic.result.warnings.map((warning,index)=><p className="warning" key={index}>{warning}</p>)}{diagnostic.result.gaps.map((gap,index)=><Finding key={index} gap={gap} />)}</>}</section>}
      {directDraft && <section><h2>Saved draft</h2><p>Answering: {directDraft.question}</p><DraftOutput draft={directDraft.result} /></section>}
      {saved && <><p>{saved.entry.title}</p><p className="subtle"><time dateTime={savedDate(saved.entry.createdAt)}>{new Date(saved.entry.createdAt).toLocaleString()}</time> · {saved.entry.status}</p>
      {saved.batch && <BatchResults batch={saved.batch} />}
      {saved.draft && <section><h2>Saved draft</h2><p>Answering: {saved.draft.question}</p><p className="subtle">Model reported: {saved.draft.result.model || "Not reported"}</p><DraftOutput draft={saved.draft.result} /></section>}
    </>}</>}
    <p><a href="/try">Run a single-question check</a></p>
  </main>;
}
