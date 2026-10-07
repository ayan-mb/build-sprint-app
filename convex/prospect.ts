import { query } from "./_generated/server";
import { v } from "convex/values";
import { publicRun } from "./validators";
import { savedDraft } from "./historyValidators";
export const resolveSaved = query({
  args: { id: v.string() },
  returns: v.object({ historyId: v.union(v.id("history"), v.null()), diagnostic: v.union(publicRun, v.null()), draft: v.union(savedDraft, v.null()) }),
  handler: async (ctx, { id }) => {
    const historyId = ctx.db.normalizeId("history", id);
    if (historyId) return { historyId, diagnostic: null, draft: null };
    const diagnosticId = ctx.db.normalizeId("diagnostics", id);
    const raw = diagnosticId ? await ctx.db.get(diagnosticId) : null;
    const diagnostic = raw ? (({ token: _private, ...safe }) => safe)(raw) : null;
    const draftId = ctx.db.normalizeId("savedDrafts", id);
    const draft = draftId ? await ctx.db.get(draftId) : null;
    return { historyId: null, diagnostic, draft };
  },
});
