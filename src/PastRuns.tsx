import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { BatchResults } from "./BatchScreen";
import { DraftOutput } from "./DraftBox";
export const savedDate = (date: number) => new Date(date).toISOString();
export default function PastRuns() {
  const {results,status,loadMore}=usePaginatedQuery(api.history.list,{}, {initialNumItems:20});
  return <section className="past-runs" aria-labelledby="past-runs-heading">
    <h2 id="past-runs-heading">Past runs</h2>
    <p className="subtle">Saved in Convex with their dates. This shared history opens without a login.</p>
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
  const saved=useQuery(api.history.read,id ? {id} : "skip");
  return <main className="saved-run"><h1>Saved result</h1>
    {!id || saved===null ? <p role="alert">This saved run could not be found. Open it from Past runs on the home screen.</p> : saved===undefined ? <p role="status">Loading saved result…</p> : <>
      <p>{saved.entry.title}</p><p className="subtle"><time dateTime={savedDate(saved.entry.createdAt)}>{new Date(saved.entry.createdAt).toLocaleString()}</time> · {saved.entry.status}</p>
      {saved.batch && <BatchResults batch={saved.batch} />}
      {saved.draft && <section><h2>Saved draft</h2><p>Answering: {saved.draft.question}</p><p className="subtle">Model reported: {saved.draft.result.model || "Not reported"}</p><DraftOutput draft={saved.draft.result} /></section>}
    </>}
    <p><a href="/">Back to Past runs</a></p>
  </main>;
}
