import test from "node:test";
import assert from "node:assert/strict";
import { begin, onComplete } from "../convex/prospectSingle";
import { DAILY_LIMIT_NAME, indiaDayStart } from "../convex/prospectLimits";

const token = "11111111-1111-1111-1111-111111111111";
test("single question validates input and cannot start when the shared daily cap is full", async () => {
  let writes = 0;
  const ctx: any = { db: {
    query: (table: string) => ({ withIndex: () => table === "batches"
      ? { order: () => ({ first: async () => null }) }
      : { unique: async () => ({ name: DAILY_LIMIT_NAME, windowStart: indiaDayStart(Date.now()), count: 100 }) } }),
    insert: async () => { writes++; }, patch: async () => { writes++; },
  } };
  await assert.rejects((begin as any)._handler(ctx, {domain:"tatacapital.com",question:"short",token}), /Each question/);
  await assert.rejects((begin as any)._handler(ctx, {domain:"tatacapital.com",question:"Which lenders offer personal loans?",token}), /shared limit of 100/);
  assert.equal(writes, 0);
});

test("single completion saves its own answer and finishes its existing history entry", async () => {
  const answer = { provider:"ChatGPT", model:"gpt-6.1-sol", status:"ready", text:"An answer", sources:[], message:"", fetchedAt:1 };
  const batch: any = {_id:"batch",domain:"tatacapital.com",questions:["Which lenders offer personal loans?"],createdAt:1,status:"running",rows:[{question:"Which lenders offer personal loans?",status:"running",answer:null,brandMention:null,lenders:[],error:""}]};
  const patches: any[] = [];
  const ctx: any = { runMutation: async () => null, db: {
    get: async (id: string) => id === "diagnostic" ? {status:"complete",stage:"Diagnostic complete",error:"",result:{answers:[answer]}} : batch,
    patch: async (id: string, fields: any) => { patches.push({id,fields}); if(id === "batch") Object.assign(batch,fields); },
    query: () => ({withIndex: () => ({unique: async () => ({_id:"this-run-history"})})}),
  } };
  await (onComplete as any)._handler(ctx, {workflowId:"workflow",result:{kind:"success",returnValue:null},context:{diagnosticId:"diagnostic",batchId:"batch"}});
  assert.equal(batch.status,"complete");
  assert.deepEqual(batch.rows[0].answer,answer);
  assert.equal(patches[1].id,"this-run-history");
  assert.equal(patches[1].fields.batchId,"batch");
});
