import { mutation, query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
export async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
}
export async function hasAdmin(ctx: QueryCtx, token: string) {
  if (!token || !process.env.ADMIN_PASSCODE) return false;
  const tokenHash = await digest(token);
  const session = await ctx.db.query("adminSessions").withIndex("by_hash", q => q.eq("hash", tokenHash)).unique();
  return !!session && session.expiresAt > Date.now() && session.passcodeHash === await digest(process.env.ADMIN_PASSCODE);
}
export async function requireAdmin(ctx: QueryCtx, token: string) {
  if (!await hasAdmin(ctx, token)) throw new Error("Admin sign-in required.");
}
export const session = query({
  args: { token: v.string() }, returns: v.object({ authorized: v.boolean(), configured: v.boolean() }),
  handler: async (ctx, { token }) => ({ authorized: await hasAdmin(ctx, token), configured: !!process.env.ADMIN_PASSCODE }),
});
export const login = mutation({
  args: { passcode: v.string() }, returns: v.object({ token: v.union(v.string(), v.null()), message: v.string() }),
  handler: async (ctx, { passcode }) => {
    const expected = process.env.ADMIN_PASSCODE;
    if (!expected) return { token: null, message: "Admin access is unavailable until ADMIN_PASSCODE is set in Convex." };
    const now = Date.now();
    const limit = await ctx.db.query("limits").withIndex("by_name", q => q.eq("name", "admin-login")).unique();
    const fresh = !limit || now - limit.windowStart >= 600000;
    if (limit && !fresh && limit.count >= 50) return { token: null, message: "Too many sign-in attempts. Try again in ten minutes." };
    if (limit) await ctx.db.patch(limit._id, { windowStart: fresh ? now : limit.windowStart, count: fresh ? 1 : limit.count + 1 });
    else await ctx.db.insert("limits", { name: "admin-login", windowStart: now, count: 1 });
    const expectedHash = await digest(expected);
    const suppliedHash = await digest(passcode.length <= 512 ? passcode : "");
    let different = 0;
    for (let i = 0; i < expectedHash.length; i++) different |= expectedHash.charCodeAt(i) ^ suppliedHash.charCodeAt(i);
    if (different) return { token: null, message: "Incorrect passcode." };
    const token = crypto.randomUUID() + crypto.randomUUID();
    await ctx.db.insert("adminSessions", { hash: await digest(token), passcodeHash: expectedHash, expiresAt: now + 8 * 3600000 });
    return { token, message: "" };
  },
});
