import { v, type Infer } from "convex/values";
export const provider = v.union(v.literal("Perplexity"), v.literal("ChatGPT"));
export const page = v.object({
  url: v.string(),
  finalUrl: v.string(),
  title: v.string(),
  text: v.string(),
  status: v.union(v.literal("read"), v.literal("unavailable")),
  message: v.string(),
  truncated: v.boolean(),
  fetchedAt: v.number(),
});
export const source = v.object({
  url: v.string(),
  title: v.string(),
  cited: v.boolean(),
  reference: v.string(),
  ownWebsite: v.boolean(),
});
export const answer = v.object({
  provider,
  model: v.string(),
  status: v.union(
    v.literal("ready"),
    v.literal("key_missing"),
    v.literal("error"),
    v.literal("no_citations"),
  ),
  text: v.string(),
  message: v.string(),
  sources: v.array(source),
  fetchedAt: v.number(),
});
export const gap = v.object({
  topic: v.string(),
  kind: v.union(
    v.literal("missing"),
    v.literal("covered"),
    v.literal("uncertain"),
  ),
  evidence: v.string(),
  sourceUrl: v.string(),
  brandEvidence: v.string(),
  explanation: v.string(),
  method: v.union(v.literal("topic_check"), v.literal("semantic")),
});
export const report = v.object({
  brandPage: page,
  answers: v.array(answer),
  sourcePages: v.array(page),
  gaps: v.array(gap),
  comparisonStatus: v.string(),
  warnings: v.array(v.string()),
});
export const runFields = {
  question: v.string(),
  website: v.string(),
  status: v.union(
    v.literal("running"),
    v.literal("complete"),
    v.literal("failed"),
  ),
  stage: v.string(),
  createdAt: v.number(),
  result: v.union(report, v.null()),
  error: v.string(),
};
export const publicRun = v.object({
  _id: v.id("diagnostics"),
  _creationTime: v.number(),
  ...runFields,
});
export type Page = Infer<typeof page>;
export type Answer = Infer<typeof answer>;
export type Source = Infer<typeof source>;
export type Gap = Infer<typeof gap>;
export type Report = Infer<typeof report>;
