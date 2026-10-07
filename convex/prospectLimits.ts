import { ConvexError } from "convex/values";
import type { MutationCtx } from "./_generated/server";
export const DAILY_SEARCH_LIMIT = 100;
export const DAILY_LIMIT_NAME = "prospect-searches-daily";
export const DAILY_CAP_MESSAGE = "Today's shared limit of 100 ChatGPT searches has been reached. Try again after midnight India time.";
export function indiaDayStart(now: number) {
  const offset = 330 * 60000;
  return Math.floor((now + offset) / 86400000) * 86400000 - offset;
}
export function dailyRemaining(limit: { windowStart: number; count: number } | null, now: number) {
  return Math.max(0, DAILY_SEARCH_LIMIT - (limit?.windowStart === indiaDayStart(now) ? limit.count : 0));
}
export async function reserveProspectSearches(ctx: MutationCtx, count: number, now: number) {
  const limit = await ctx.db.query("limits").withIndex("by_name", q => q.eq("name", DAILY_LIMIT_NAME)).unique();
  const remaining = dailyRemaining(limit, now);
  if (count > remaining) throw new ConvexError(remaining === 0 ? DAILY_CAP_MESSAGE : `Only ${remaining} ChatGPT searches remain in today's shared limit of 100. Reduce your batch or try again after midnight India time.`);
  const fields = { name: DAILY_LIMIT_NAME, windowStart: indiaDayStart(now), count: DAILY_SEARCH_LIMIT - remaining + count };
  if (limit) await ctx.db.patch(limit._id, fields);
  else await ctx.db.insert("limits", fields);
}
