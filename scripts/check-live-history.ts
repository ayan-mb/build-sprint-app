import { execFileSync } from "node:child_process";
import { appendFileSync,writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { batchSummary } from "../convex/batchEvidence";
import type { Id } from "../convex/_generated/dataModel";
const url="https://frugal-moose-32.convex.cloud";
const client=new ConvexHttpClient(url);
const question="best personal loans for CIBIL under 700";
const diagnosticId="j57fwsrm2fnpgab0jt0j8s0wvh8fma3f" as Id<"diagnostics">;
const capture=JSON.parse(execFileSync("npx",["convex","run","draftData:testCapture",JSON.stringify({id:diagnosticId}),"--prod","--typecheck=disable","--codegen=disable"],{encoding:"utf8",timeout:30000}));
assert.equal(capture.question,question);
console.log("Checking real draft persistence and export data.");
let generated;
if (!process.argv.includes("--resume")) {
  generated=await client.action(api.drafts.generate,{id:diagnosticId,token:capture.token,factSheet:capture.page.text.replace(/(?<=[.!?])\s+(?=[A-Z])/g,"\n")});
}
const freshDraftVisitor=new ConvexHttpClient(url);
const firstPage=await freshDraftVisitor.query(api.history.list,{paginationOpts:{numItems:50,cursor:null}});
const draftEntry=firstPage.page.find(entry=>entry.kind==="draft");
assert.ok(draftEntry);
const savedDraft=await freshDraftVisitor.query(api.history.read,{id:draftEntry._id});
assert.ok(savedDraft?.draft);
const draft=savedDraft.draft.result;
if (generated) assert.deepEqual(draft,generated);
assert.ok(savedDraft.draft.createdAt);
console.log(`Draft saved and read back exactly: ${draft.status}.`);
const token=randomUUID();
const questions=[question,"Which lenders offer personal loans for salaried employees in India?","Which lenders offer personal loans with low processing fees in India?","Which lenders offer personal loans with flexible repayment tenure in India?","Which lenders offer personal loans with online applications in India?"];
assert.equal(questions.length,5);
const batchId=await client.mutation(api.batches.begin,{domain:"tatacapital.com",questions,token});
let lastStage="";
const deadline=Date.now()+12*60*1000;
while(Date.now()<deadline){
  const batch=await client.query(api.batches.current,{token}); assert.ok(batch);
  assert.equal(batch.rows.length,5);
  assert.ok(batch.rows.filter(row=>row.status==="running").length<=1);
  if(batch.stage!==lastStage){console.log(batch.stage);lastStage=batch.stage;}
  if(batch.status!=="running"){
    assert.equal(batch.status,"complete");
    const freshVisitor=new ConvexHttpClient(url);
    let cursor:string|null=null;
    const entries=[];
    for(;;){
      const result=await freshVisitor.query(api.history.list,{paginationOpts:{numItems:50,cursor}});
      entries.push(...result.page);
      if(result.isDone)break;
      cursor=result.continueCursor;
    }
    const entry=entries.find(item=>item.batchId===batchId); assert.ok(entry,"New run is missing from Past runs");
    const reopened=await freshVisitor.query(api.history.read,{id:entry._id});
    assert.deepEqual(reopened?.batch,batch,"Saved run differs from the completed run");
    assert.deepEqual(reopened?.batch?.summary,batchSummary(batch.rows));
    assert.equal(await freshVisitor.query(api.batches.current,{token:randomUUID()}),null);
    const summary=batch.summary!;
    const section=`\nAnswers naming your brand: ${summary.brand} of ${summary.completed} completed answers.\nMerged lender counts (answers per lender): ${summary.lenders.map(item=>`${item.name}: ${item.count}`).join("; ") || "None"}.\n\nPast runs list read back from the database:\n${entries.map(item=>`- ${new Date(item.createdAt).toISOString()} — ${item.title} — ${item.status}`).join("\n")}\n`;
    appendFileSync("BUILD_LOG.md",section);
    writeFileSync("/tmp/build-sprint-history-test.json",JSON.stringify({draftHistoryId:draftEntry._id,batchHistoryId:entry._id,draftText:draft.text,draftStatus:draft.status,section}));
    console.log(section); process.exit(0);
  }
  await new Promise(resolve=>setTimeout(resolve,1500));
}
throw new Error("Batch timed out. No automatic paid retry was made.");
