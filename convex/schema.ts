import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { runFields } from "./validators";
export default defineSchema({
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
