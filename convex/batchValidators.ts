import { v, type Infer } from "convex/values";
import { answer } from "./validators";
export const batchRow = v.object({
  question: v.string(), status: v.union(v.literal("pending"), v.literal("running"), v.literal("complete"), v.literal("error")),
  answer: v.union(answer, v.null()), brandMention: v.union(v.boolean(), v.null()),
  brandNames: v.optional(v.array(v.string())), lenders: v.array(v.string()), lenderMentions: v.optional(v.array(v.object({ name: v.string(), canonicalName: v.string() }))), error: v.string(),
});
export const savedSummary = v.object({ completed: v.number(), failed: v.number(), brand: v.number(), lenders: v.array(v.object({ name: v.string(), count: v.number() })), domains: v.array(v.object({ domain: v.string(), count: v.number() })) });
export const batchFields = {
  domain: v.string(), questions: v.array(v.string()), rows: v.array(batchRow), createdAt: v.number(),
  summary: v.optional(savedSummary),
  status: v.union(v.literal("running"), v.literal("complete"), v.literal("failed")), stage: v.string(),
};
export const publicBatch = v.object({ _id: v.id("batches"), _creationTime: v.number(), ...batchFields });
export type BatchRow = Infer<typeof batchRow>;
export type Batch = Infer<typeof publicBatch>;
