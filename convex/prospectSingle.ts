import { mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { start, vWorkflowId } from "@convex-dev/workflow";
import { vResultValidator } from "@convex-dev/workpool";
import { batchInput, batchSummary } from "./batchEvidence";
import { reserveProspectSearches, DAILY_CAP_MESSAGE } from "./prospectLimits";
import { recordBatch } from "./history";
import { workflow } from "./diagnosticWorkflow";

export const run = workflow.define({
  args: { diagnosticId: v.id("diagnostics"), batchId: v.id("batches"), question: v.string(), website: v.string() },
  returns: v.null(),
}).handler(async (step, args): Promise<null> => {
  const allowed = await step.runMutation(internal.prospectBatches.claimSearch, { batchId: args.batchId, index: 0 });
  if (!allowed) throw new Error(DAILY_CAP_MESSAGE);
  await step.runWorkflow(internal.diagnosticWorkflow.run, { id: args.diagnosticId, question: args.question, website: args.website });
  return null;
});

export const begin = mutation({
  args: { domain: v.string(), question: v.string(), token: v.string() },
  returns: v.object({ diagnosticId: v.id("diagnostics"), batchId: v.id("batches") }),
  handler: async (ctx, args) => {
    if (!/^[a-f0-9-]{36}$/.test(args.token)) throw new Error("Reload the page to start a new session.");
    const { domain, website, questions } = batchInput(args.domain, [args.question]);
    const previous = await ctx.db.query("batches").withIndex("by_token", q => q.eq("token", args.token)).order("desc").first();
    if (previous?.status === "running") throw new Error("Wait for your current batch to finish.");
    const now = Date.now();
    await reserveProspectSearches(ctx, 1, now);
    const diagnosticId = await ctx.db.insert("diagnostics", {
      question: questions[0], website, token: args.token, createdAt: now,
      status: "running", stage: "Reading your page and asking ChatGPT", result: null, error: "",
    });
    const batchId = await ctx.db.insert("batches", {
      domain, questions, token: args.token, createdAt: now, status: "running",
      stage: "Reading your page and asking ChatGPT",
      rows: [{ question: questions[0], status: "running", answer: null, brandMention: null, lenders: [], error: "" }],
    });
    await ctx.db.insert("limits", { name: `prospect-batch:${batchId}`, windowStart: now, count: 1 });
    await recordBatch(ctx, batchId);
    await start(ctx, internal.prospectSingle.run, { diagnosticId, batchId, question: questions[0], website }, {
      onComplete: internal.prospectSingle.onComplete, context: { diagnosticId, batchId },
    });
    return { diagnosticId, batchId };
  },
});

export const onComplete = internalMutation({
  args: { workflowId: vWorkflowId, result: vResultValidator, context: v.object({ diagnosticId: v.id("diagnostics"), batchId: v.id("batches") }) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.diagnostics.onComplete, { workflowId: args.workflowId, result: args.result, context: { id: args.context.diagnosticId } });
    const diagnostic = await ctx.db.get(args.context.diagnosticId);
    const batch = await ctx.db.get(args.context.batchId);
    if (!diagnostic || !batch) throw new Error("Run not found.");
    const answer = diagnostic.result?.answers.find(a => a.provider === "ChatGPT") || null;
    const error = diagnostic.error || (answer?.status === "error" || answer?.status === "key_missing" ? answer.message : "");
    const rows = [{ ...batch.rows[0], answer, status: error || !answer ? "error" as const : "complete" as const, error }];
    await ctx.db.patch(batch._id, { rows, status: diagnostic.status === "failed" ? "failed" : "complete", stage: diagnostic.stage, summary: batchSummary(rows) });
    await recordBatch(ctx, batch._id);
    return null;
  },
});
