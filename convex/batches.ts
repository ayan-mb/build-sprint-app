import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { start, vWorkflowId } from "@convex-dev/workflow";
import { vResultValidator } from "@convex-dev/workpool";
import { batchRow, publicBatch } from "./batchValidators";
import { batchInput } from "./batchEvidence";
export const begin = mutation({
  args: { domain: v.string(), questions: v.array(v.string()), token: v.string() }, returns: v.id("batches"),
  handler: async (ctx, args) => {
    if (!/^[a-f0-9-]{36}$/.test(args.token)) throw new Error("Reload the page to start a new session.");
    const { domain, questions, website } = batchInput(args.domain, args.questions);
    const last = await ctx.db.query("batches").withIndex("by_token", q => q.eq("token", args.token)).order("desc").first();
    if (last?.status === "running") throw new Error("Wait for your current batch to finish.");
    const now = Date.now();
    const limit = await ctx.db.query("limits").withIndex("by_name", q => q.eq("name", "batch-questions-hourly")).unique();
    const fresh = !limit || now-limit.windowStart >= 3600000;
    if (limit && !fresh && limit.count + questions.length > 100) throw new Error("The hourly batch limit has been reached. Try later.");
    if (limit) await ctx.db.patch(limit._id, { count: (fresh ? 0 : limit.count) + questions.length, windowStart: fresh ? now : limit.windowStart });
    else await ctx.db.insert("limits", { name: "batch-questions-hourly", count: questions.length, windowStart: now });
    const id = await ctx.db.insert("batches", { domain, questions, token: args.token, createdAt: now, status: "running", stage: `Starting ${questions.length} questions`, rows: questions.map(question => ({ question, status: "pending" as const, answer: null, brandMention: null, lenders: [], error: "" })) });
    await start(ctx, internal.batchWorkflow.run, { id, website, domain, questions }, { onComplete: internal.batches.onComplete, context: { id } });
    return id;
  },
});
export const current = query({
  args: { token: v.string() }, returns: v.union(publicBatch, v.null()),
  handler: async (ctx, { token }) => {
    const doc = await ctx.db.query("batches").withIndex("by_token", q => q.eq("token", token)).order("desc").first();
    if (!doc) return null;
    const { token: _token, ...safe } = doc;
    return safe;
  },
});
export const saveRow = internalMutation({
  args: { id: v.id("batches"), index: v.number(), row: batchRow, stage: v.string() }, returns: v.null(),
  handler: async (ctx, { id,index,row,stage }) => {
    const batch = await ctx.db.get(id);
    if (!batch || !Number.isInteger(index) || index < 0 || index >= batch.rows.length) throw new Error("Invalid batch row");
    const rows = [...batch.rows]; rows[index] = row;
    await ctx.db.patch(id, { rows, stage }); return null;
  },
});
export const finish = internalMutation({
  args: { id: v.id("batches") }, returns: v.null(),
  handler: async (ctx, { id }) => { await ctx.db.patch(id, { status: "complete", stage: "Batch complete" }); return null; },
});
export const onComplete = internalMutation({
  args: { workflowId: vWorkflowId, result: vResultValidator, context: v.object({ id: v.id("batches") }) }, returns: v.null(),
  handler: async (ctx, args) => {
    if (args.result.kind !== "success") {
      const batch = await ctx.db.get(args.context.id);
      if (batch) await ctx.db.patch(batch._id, { status: "failed", stage: "Batch stopped", rows: batch.rows.map(row => row.status === "pending" || row.status === "running" ? { ...row, status: "error" as const, error: "The batch stopped before this question finished. No automatic paid retry was made." } : row) });
    }
    return null;
  },
});
