import { ConvexError } from "convex/values";
import { test } from "node:test";
import assert from "node:assert/strict";
import { dailyRemaining, indiaDayStart, reserveProspectSearches, DAILY_LIMIT_NAME } from "../convex/prospectLimits";
import { claimSearch, savedLink } from "../convex/prospectBatches";
import { begin, startBatch } from "../convex/batches";
function fixture(initial: any[] = []) {
  const records = new Map(initial.map(item => [item.name,item]));
  let reads=0;
  const ctx:any={db:{query:()=>({withIndex:(_:string,fn:any)=>{let name="";fn({eq:(_:string,value:string)=>{name=value;}});return {unique:async()=>{reads++;return records.get(name)||null;}};}}),patch:async(id:string,fields:any)=>{records.set(fields.name,{_id:id,...fields});},insert:async(_:string,fields:any)=>{records.set(fields.name,{_id:fields.name,...fields});return fields.name;}}};
  return {ctx,records,reads:()=>reads};
}
const now=Date.parse("2026-10-07T12:00:00Z");
test("prospect allowance is shared, accepts exactly 100, and rejects excess without changing the counter",async()=>{
  const {ctx,records}=fixture();
  await reserveProspectSearches(ctx,60,now); await reserveProspectSearches(ctx,40,now);
  assert.equal(records.get(DAILY_LIMIT_NAME).count,100);
  await assert.rejects(reserveProspectSearches(ctx,1,now), error => error instanceof ConvexError && typeof error.data === "string" && error.data.includes("shared limit of 100"));
  assert.equal(records.get(DAILY_LIMIT_NAME).count,100);
});
test("prospect cap rejects an oversized remaining batch and resets at midnight India time",async()=>{
  const {ctx,records}=fixture([{_id:"daily",name:DAILY_LIMIT_NAME,windowStart:indiaDayStart(now),count:95}]);
  await assert.rejects(reserveProspectSearches(ctx,6,now),/Only 5 ChatGPT searches remain/);
  assert.equal(records.get(DAILY_LIMIT_NAME).count,95);
  const midnight=Date.parse("2026-10-07T18:30:00Z");
  assert.equal(dailyRemaining(records.get(DAILY_LIMIT_NAME),midnight-1),5);
  assert.equal(dailyRemaining(records.get(DAILY_LIMIT_NAME),midnight),100);
  await reserveProspectSearches(ctx,20,midnight);
  assert.equal(records.get(DAILY_LIMIT_NAME).count,20);
});
test("unchanged 20-question validation runs before prospect quota writes and admin entry cannot bypass the cap anonymously",async()=>{
  const {ctx,reads}=fixture();
  await assert.rejects(startBatch(ctx,{domain:"tatacapital.com",questions:Array(21).fill("Which lenders offer personal loans?"),token:"11111111-1111-1111-1111-111111111111"},true),/hard limit/);
  assert.equal(reads(),0);
  await assert.rejects((begin as any)._handler(ctx,{domain:"tatacapital.com",questions:["Which lenders offer personal loans?"],token:"11111111-1111-1111-1111-111111111111"}),/Admin sign-in required/);
});
test("overnight prospect searches respect the next day cap and are claimed once; admin searches do not use the prospect allowance",async()=>{
  const original=Date.now; Date.now=()=>now;
  try {
    const marker={name:"prospect-batch:batch",_id:"marker",windowStart:now-86400000,count:20};
    const {ctx,records}=fixture([marker,{_id:"daily",name:DAILY_LIMIT_NAME,windowStart:indiaDayStart(now),count:99}]);
    assert.equal(await (claimSearch as any)._handler(ctx,{batchId:"batch",index:0}),true);
    assert.equal(await (claimSearch as any)._handler(ctx,{batchId:"batch",index:0}),true);
    assert.equal(records.get(DAILY_LIMIT_NAME).count,100);
    assert.equal(await (claimSearch as any)._handler(ctx,{batchId:"batch",index:1}),false);
    assert.equal(await (claimSearch as any)._handler(ctx,{batchId:"admin-batch",index:0}),true);
    assert.equal(records.get(DAILY_LIMIT_NAME).count,100);
  } finally { Date.now=original; }
});
test("saved batch link only belongs to the requesting session and appears after completion",async()=>{
  let batch={token:"owner",status:"running"};
  const ctx:any={db:{get:async()=>batch,query:()=>({withIndex:()=>({unique:async()=>({_id:"own-history-link"})})})}};
  assert.equal(await (savedLink as any)._handler(ctx,{batchId:"batch",token:"owner"}),null);
  batch={token:"owner",status:"complete"};
  assert.equal(await (savedLink as any)._handler(ctx,{batchId:"batch",token:"someone-else"}),null);
  assert.equal(await (savedLink as any)._handler(ctx,{batchId:"batch",token:"owner"}),"own-history-link");
});
