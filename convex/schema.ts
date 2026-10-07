import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { runFields } from "./validators";
import { batchFields } from "./batchValidators";
import { historyFields, draftFields } from "./historyValidators";
export default defineSchema({
  adminSessions: defineTable({ hash: v.string(), passcodeHash: v.string(), expiresAt: v.number() }).index("by_hash", ["hash"]),
  history: defineTable(historyFields).index("by_date",["createdAt"]).index("by_batch",["batchId"]),
  savedDrafts: defineTable(draftFields).index("by_date",["createdAt"]),
  batches: defineTable({ ...batchFields, token: v.string() }).index("by_token", ["token"]).index("by_date",["createdAt"]),
  diagnostics: defineTable({ ...runFields, token: v.string() }).index(
    "by_token",
    ["token"],
  ),
  limits: defineTable({
    name: v.string(),
    windowStart: v.number(),
    count: v.number(),
  }).index("by_name", ["name"]),
});
