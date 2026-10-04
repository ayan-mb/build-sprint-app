import { test } from "node:test";
import assert from "node:assert/strict";
import { list,read,saveDraft } from "../convex/history";
test("history pagination accepts the extra fields returned by Convex",async()=>{
  const result={page:[],isDone:true,continueCursor:"cursor",splitCursor:null,pageStatus:null};
  const ctx={db:{query:()=>({withIndex:()=>({order:()=>({paginate:async()=>result})})})}};
  const returned=await (list as any)._handler(ctx,{paginationOpts:{numItems:20,cursor:null}});
  const contract=JSON.parse((list as any).exportReturns());
  for(const key of Object.keys(returned)) assert.ok(contract.value[key],`Convex pagination field ${key} must be allowed by the query return check`);
});
test("saved runs reopen exact database content without exposing their session token",async()=>{
  const entry={_id:"history",kind:"batch",batchId:"batch",createdAt:123,title:"run",status:"complete"};
  const original={_id:"batch",token:"private-session-fixture",createdAt:123,rows:[{answer:{text:"Original answer"}}],summary:{brand:1}};
  const ctx={db:{get:async(id:string)=>id==="history"?entry:original}};
  const reopened=await (read as any)._handler(ctx,{id:"history"});
  assert.equal(reopened.batch.token,undefined);
  const {token:_token,...expected}=original;
  assert.deepEqual(reopened.batch,expected);
  assert.equal(original.token,"private-session-fixture");
});
test("draft saving stores the entire original result and a dated history link",async()=>{
  const inserts:{table:string;data:any}[]=[];
  const ctx={db:{insert:async(table:string,data:any)=>{inserts.push({table,data});return `${table}-id`;}}};
  const result={status:"ready",text:"[add: APR]",model:"fixture",message:"Review",placeholders:["[add: APR]"],numbers:[]};
  await (saveDraft as any)._handler(ctx,{question:"Which personal loans?",result});
  assert.deepEqual(inserts[0].data.result,result);
  assert.ok(inserts[0].data.createdAt>0);
  assert.equal(inserts[1].data.createdAt,inserts[0].data.createdAt);
  assert.equal(inserts[1].data.draftId,"savedDrafts-id");
});
