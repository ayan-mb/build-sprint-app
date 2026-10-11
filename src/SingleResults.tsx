import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Batch } from "../convex/batchValidators";
import { PageRead, ProviderAnswer, Finding } from "./App";
import DraftBox from "./DraftBox";

export default function SingleResults({ token, batch }: { token: string; batch: Batch }) {
  const run = useQuery(api.diagnostics.current, { token });
  if (!run || run.createdAt !== batch.createdAt) return null;
  return <section className="batch-results" aria-label="Single-question results">
    <h2>Single-question check</h2>
    <p role="status">{run.stage}</p>
    {run.error && <p className="warning" role="alert">{run.error}</p>}
    {run.result && <>
      <h3>Your NBFC page</h3>
      <PageRead page={run.result.brandPage} />
      {run.result.answers.filter(a => a.provider === "ChatGPT").map(answer => <ProviderAnswer key={answer.provider} answer={answer} />)}
      <h3>What the cited pages cover</h3>
      <p>{run.result.comparisonStatus}</p>
      {run.result.warnings.map(warning => <p className="warning" key={warning}>{warning}</p>)}
      {run.result.gaps.map((gap, index) => <Finding key={index} gap={gap} />)}
      <DraftBox key={run._id} id={run._id} token={token} question={run.question} />
    </>}
  </section>;
}
