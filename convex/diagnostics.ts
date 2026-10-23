import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { start, vWorkflowId } from "@convex-dev/workflow";
import { vResultValidator } from "@convex-dev/workpool";
import { publicRun, report, page, type Report } from "./validators";
import { publicUrl } from "./evidence";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./admin";
export const begin = mutation({
  args: { question: v.string(), website: v.string(), token: v.string(), adminToken: v.optional(v.string()) },
  returns: v.id("diagnostics"),
  handler: async (ctx, args): Promise<Id<"diagnostics">> => {
    await requireAdmin(ctx, args.adminToken || "");
    const question = args.question.trim();
    if (question.length < 10 || question.length > 600)
      throw new Error(
        "Use one borrower question between 10 and 600 characters.",
      );
    const website = publicUrl(args.website);
    if (website.length > 2000) throw new Error("The URL is too long.");
    if (!/^[a-f0-9-]{36}$/.test(args.token))
      throw new Error("Reload the page to start a new session.");
    const now = Date.now();
    const last = await ctx.db
      .query("diagnostics")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .order("desc")
      .first();
    if (
      last &&
      ((last.status === "running" && now - last.createdAt < 300000) ||
        now - last.createdAt < 30000)
    )
      throw new Error(
        "Please wait for the current run, or wait 30 seconds before trying again.",
      );
    const limit = await ctx.db
      .query("limits")
      .withIndex("by_name", (q) => q.eq("name", "diagnostics"))
      .unique();
    const fresh = !limit || now - limit.windowStart >= 3600000;
    if (limit && !fresh && limit.count >= 30)
      throw new Error(
        "The hourly limit of 30 diagnostics has been reached. Try again later.",
      );
    if (limit)
      await ctx.db.patch(limit._id, {
        windowStart: fresh ? now : limit.windowStart,
        count: fresh ? 1 : limit.count + 1,
      });
    else
      await ctx.db.insert("limits", {
        name: "diagnostics",
        windowStart: now,
        count: 1,
      });
    const id = await ctx.db.insert("diagnostics", {
      question,
      website,
      token: args.token,
      status: "running",
      stage: "Reading your page and asking ChatGPT",
      createdAt: now,
      result: null,
      error: "",
    });
    await start(
      ctx,
      internal.diagnosticWorkflow.run,
      { id, question, website },
      { onComplete: internal.diagnostics.onComplete, context: { id } },
    );
    return id;
  },
});
export const current = query({
  args: { token: v.string() },
  returns: v.union(publicRun, v.null()),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("diagnostics")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .order("desc")
      .first();
    if (!doc) return null;
    const { token: _private, ...safe } = doc;
    return safe;
  },
});
export const updateStage = internalMutation({
  args: { id: v.id("diagnostics"), stage: v.string() },
  returns: v.null(),
  handler: async (ctx, { id, stage }) => {
    await ctx.db.patch(id, { stage });
    return null;
  },
});
export const finish = internalMutation({
  args: { id: v.id("diagnostics"), result: report },
  returns: v.null(),
  handler: async (ctx, { id, result }) => {
    await ctx.db.patch(id, {
      result,
      status: "complete",
      stage: "Diagnostic complete",
    });
    return null;
  },
});
export const onComplete = internalMutation({
  args: {
    workflowId: vWorkflowId,
    result: vResultValidator,
    context: v.object({ id: v.id("diagnostics") }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.result.kind !== "success")
      await ctx.db.patch(args.context.id, {
        status: "failed",
        stage: "Run stopped",
        error:
          "The diagnostic could not finish. Please run it again. Completed provider calls are not retried automatically.",
      });
    return null;
  },
});

export const comparisonInput = internalQuery({
  args: { id: v.id("diagnostics") },
  returns: v.union(v.object({ question: v.string(), brandPage: page, sourcePages: v.array(page) }), v.null()),
  handler: async (ctx, { id }) => {
    const run = await ctx.db.get(id);
    if (!run?.result) return null;
    return { question: run.question, brandPage: run.result.brandPage, sourcePages: run.result.sourcePages };
  },
});
