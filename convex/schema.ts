import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { runFields } from "./validators";
import { batchFields } from "./batchValidators";
export default defineSchema({
  batches: defineTable({ ...batchFields, token: v.string() }).index("by_token", ["token"]),
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
