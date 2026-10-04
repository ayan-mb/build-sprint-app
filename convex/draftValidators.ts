import { v, type Infer } from "convex/values";
export const draftResult = v.object({
  status: v.union(v.literal("ready"), v.literal("unavailable")),
  text: v.string(), message: v.string(), model: v.string(),
  placeholders: v.array(v.string()),
  numbers: v.array(v.object({ number: v.string(), draftLine: v.number(), sheetLine: v.number(), passage: v.string() })),
});
export type DraftResult = Infer<typeof draftResult>;
