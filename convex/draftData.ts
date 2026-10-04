import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { page } from "./validators";
export const reserve = internalMutation({
  args: { id: v.id("diagnostics"), token: v.string() },
  returns: v.object({ question: v.string(), gapTopics: v.array(v.string()) }),
  handler: async (ctx, { id, token }) => {
    const run = await ctx.db.get(id);
    if (!run || run.token !== token || run.status !== "complete" || !run.result) throw new Error("A completed report from your session is required.");
    const now = Date.now();
    const session = await ctx.db.query("limits").withIndex("by_name", q => q.eq("name", `draft:${token}`)).unique();
    if (session && now - session.windowStart < 90000) throw new Error("Wait for your draft, or wait a little before generating another.");
    const global = await ctx.db.query("limits").withIndex("by_name", q => q.eq("name", "drafts-hourly")).unique();
    const fresh = !global || now - global.windowStart >= 3600000;
    if (global && !fresh && global.count >= 30) throw new Error("The hourly draft limit has been reached. Try later.");
    if (session) await ctx.db.patch(session._id, { windowStart: now, count: 1 });
    else await ctx.db.insert("limits", { name: `draft:${token}`, windowStart: now, count: 1 });
    if (global) await ctx.db.patch(global._id, { windowStart: fresh ? now : global.windowStart, count: fresh ? 1 : global.count + 1 });
    else await ctx.db.insert("limits", { name: "drafts-hourly", windowStart: now, count: 1 });
    return { question: run.question, gapTopics: [...new Set(run.result.gaps.filter(g => g.kind !== "covered").map(g => g.topic))].slice(0, 12) };
  },
});
// Authenticated CLI only: public page captures are used for the requested live test.
export const testCapture = internalQuery({
  args: { id: v.id("diagnostics") },
  returns: v.union(v.object({ question: v.string(), token: v.string(), page }), v.null()),
  handler: async (ctx, { id }) => {
    const run = await ctx.db.get(id);
    return run?.result ? { question: run.question, token: run.token, page: run.result.brandPage } : null;
  },
});
