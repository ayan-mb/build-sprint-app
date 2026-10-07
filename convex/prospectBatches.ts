import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { startBatch } from "./batches";
import { dailyRemaining, DAILY_LIMIT_NAME, indiaDayStart, reserveProspectSearches } from "./prospectLimits";
export const begin = mutation({
  args: { domain: v.string(), questions: v.array(v.string()), token: v.string() }, returns: v.id("batches"),
  handler: async (ctx,args) => await startBatch(ctx,args,true),
});
export const allowance = query({
  args: { day: v.optional(v.number()) }, returns: v.object({ remaining: v.number() }),
  handler: async ctx => {
    const limit = await ctx.db.query("limits").withIndex("by_name", q => q.eq("name", DAILY_LIMIT_NAME)).unique();
    return { remaining: dailyRemaining(limit,Date.now()) };
  },
});
export const savedLink = query({
  args: { batchId: v.id("batches"), token: v.string() }, returns: v.union(v.id("history"),v.null()),
  handler: async (ctx,{batchId,token}) => {
    const batch = await ctx.db.get(batchId);
    if (!batch || batch.token !== token || batch.status === "running") return null;
    const saved = await ctx.db.query("history").withIndex("by_batch", q => q.eq("batchId",batchId)).unique();
    return saved?._id || null;
  },
});

// A batch accepted before midnight must still respect the new day's cap.
// Claim each search once, before the existing ChatGPT action runs.
export const claimSearch = internalMutation({
  args: { batchId: v.id("batches"), index: v.number() }, returns: v.boolean(),
  handler: async (ctx,{batchId,index}) => {
    const reservation = await ctx.db.query("limits").withIndex("by_name", q => q.eq("name", `prospect-batch:${batchId}`)).unique();
    if (!reservation) return true; // Existing admin batches have no prospect reservation.
    if (!Number.isInteger(index) || index < 0 || index >= reservation.count) throw new Error("Invalid prospect question");
    const name = `prospect-search:${batchId}:${index}`;
    const claimed = await ctx.db.query("limits").withIndex("by_name", q => q.eq("name",name)).unique();
    if (claimed) return true;
    const now = Date.now();
    if (indiaDayStart(reservation.windowStart) !== indiaDayStart(now)) {
      const daily = await ctx.db.query("limits").withIndex("by_name", q => q.eq("name",DAILY_LIMIT_NAME)).unique();
      if (dailyRemaining(daily,now) === 0) return false;
      await reserveProspectSearches(ctx,1,now);
    }
    await ctx.db.insert("limits", {name,windowStart:now,count:1});
    return true;
  },
});
