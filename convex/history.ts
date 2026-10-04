import { query, internalMutation, type MutationCtx } from "./_generated/server";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { v } from "convex/values";
import { historyItem, savedDraft } from "./historyValidators";
import { draftResult } from "./draftValidators";
import { batchSummary } from "./batchEvidence";
import { publicBatch } from "./batchValidators";
import type { Id } from "./_generated/dataModel";
export async function recordBatch(ctx: MutationCtx, id: Id<"batches">) {
  const batch = await ctx.db.get(id);
  if (!batch) throw new Error("Saved batch not found");
  const existing = await ctx.db.query("history").withIndex("by_batch",q => q.eq("batchId",id)).unique();
  const fields = { kind: "batch" as const, createdAt: batch.createdAt, title: `${batch.domain} — ${batch.questions.length} questions`, status: batch.status, batchId: id };
  if (existing) await ctx.db.patch(existing._id,fields);
  else await ctx.db.insert("history",fields);
}
export const saveDraft = internalMutation({
  args: { question: v.string(), result: draftResult }, returns: v.id("savedDrafts"),
  handler: async (ctx,args) => {
    const createdAt=Date.now();
    const id = await ctx.db.insert("savedDrafts",{...args,createdAt});
    await ctx.db.insert("history",{kind:"draft",createdAt,title:`Draft — ${args.question}`,status:args.result.status,draftId:id});
    return id;
  },
});
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(historyItem),
  handler: async (ctx,args) => {
    const count=args.paginationOpts.numItems;
    if (count<1 || count>50) throw new Error("Use a history page size between 1 and 50.");
    return await ctx.db.query("history").withIndex("by_date").order("desc").paginate(args.paginationOpts);
  },
});
export const read = query({
  args: { id:v.id("history") },
  returns:v.union(v.object({entry:historyItem,batch:v.union(publicBatch,v.null()),draft:v.union(savedDraft,v.null())}),v.null()),
  handler:async (ctx,{id}) => {
    const entry=await ctx.db.get(id);
    if (!entry) return null;
    const raw = entry.batchId ? await ctx.db.get(entry.batchId) : null;
    const batch = raw ? (({token:_token,...safe})=>safe)(raw) : null;
    const draft=entry.draftId ? await ctx.db.get(entry.draftId) : null;
    return {entry,batch,draft};
  },
});
// Populate history for existing database runs without generating new answers.
export const backfillBatches = internalMutation({
  args:{paginationOpts:paginationOptsValidator}, returns:v.object({isDone:v.boolean(),continueCursor:v.string(),count:v.number()}),
  handler:async(ctx,args)=>{
    const result=await ctx.db.query("batches").withIndex("by_date").paginate(args.paginationOpts);
    for(const batch of result.page) await recordBatch(ctx,batch._id);
    return {isDone:result.isDone,continueCursor:result.continueCursor,count:result.page.length};
  },
});

// Apply requested reporting aliases to saved summaries while preserving original rows and answers.
export const refreshSummaries = internalMutation({
  args:{paginationOpts:paginationOptsValidator},returns:v.object({isDone:v.boolean(),continueCursor:v.string(),count:v.number()}),
  handler:async(ctx,args)=>{
    const page=await ctx.db.query("batches").withIndex("by_date").paginate(args.paginationOpts);
    for(const batch of page.page) if(batch.status!=="running") await ctx.db.patch(batch._id,{summary:batchSummary(batch.rows)});
    return {isDone:page.isDone,continueCursor:page.continueCursor,count:page.page.length};
  },
});
