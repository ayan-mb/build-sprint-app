import { v } from "convex/values";
import { draftResult } from "./draftValidators";
export const historyFields = { kind: v.union(v.literal("batch"),v.literal("draft")), createdAt: v.number(), title: v.string(), status: v.string(), batchId: v.optional(v.id("batches")), draftId: v.optional(v.id("savedDrafts")) };
export const historyItem = v.object({ _id: v.id("history"), _creationTime: v.number(), ...historyFields });
export const draftFields = { question: v.string(), createdAt: v.number(), result: draftResult };
export const savedDraft = v.object({ _id: v.id("savedDrafts"), _creationTime: v.number(), ...draftFields });
