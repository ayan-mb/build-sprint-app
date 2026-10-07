import { test } from "node:test";
import assert from "node:assert/strict";
import { login, session, digest } from "../convex/admin";
import { list } from "../convex/history";
import { resolveSaved } from "../convex/prospect";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { RunLink } from "../src/RunLink";
test("admin fails closed without configuration and history rejects anonymous callers", async () => {
  const previous = process.env.ADMIN_PASSCODE; delete process.env.ADMIN_PASSCODE;
  try {
    assert.equal((await (login as any)._handler({}, {passcode:""})).token, null);
    assert.deepEqual(await (session as any)._handler({}, {token:""}), {authorized:false,configured:false});
    await assert.rejects((list as any)._handler({}, {adminToken:"",paginationOpts:{numItems:20,cursor:null}}), /Admin sign-in required/);
  } finally { if (previous === undefined) delete process.env.ADMIN_PASSCODE; else process.env.ADMIN_PASSCODE=previous; }
});
test("server verifies credentials, stores only hashes, and rejects expired sessions", async () => {
  const previous = process.env.ADMIN_PASSCODE;
  // Local test fixture only. No deployment environment is written.
  process.env.ADMIN_PASSCODE = "unit-test-fixture";
  let stored:any;
  const ctx={db:{query:(table:string)=>({withIndex:()=>({unique:async()=>table==="adminSessions"?stored:null})}),insert:async(table:string,value:any)=>{if(table==="adminSessions")stored=value;return "fixture-id";}}};
  try {
    assert.equal((await (login as any)._handler(ctx,{passcode:"incorrect-fixture"})).token,null);
    const result=await (login as any)._handler(ctx,{passcode:process.env.ADMIN_PASSCODE});
    assert.ok(result.token); assert.equal(stored.hash,await digest(result.token));
    assert.equal(stored.passcodeHash,await digest(process.env.ADMIN_PASSCODE));
    assert.equal((await (session as any)._handler(ctx,{token:result.token})).authorized,true);
    stored.expiresAt=0;
    assert.equal((await (session as any)._handler(ctx,{token:result.token})).authorized,false);
  } finally { if(previous===undefined)delete process.env.ADMIN_PASSCODE;else process.env.ADMIN_PASSCODE=previous; }
});
test("new saved diagnostic links reveal the exact report without its session token", async () => {
  const original={_id:"diagnostic-id",token:"private",result:{answers:[{text:"Unchanged answer"}]}};
  const ctx={db:{normalizeId:(table:string)=>table==="diagnostics"?"diagnostic-id":null,get:async()=>original}};
  const result=await (resolveSaved as any)._handler(ctx,{id:"diagnostic-id"});
  assert.deepEqual(result.diagnostic,{_id:"diagnostic-id",result:original.result});
  assert.equal(original.token,"private");
  const html=renderToStaticMarkup(createElement(RunLink,{id:"diagnostic-id"}));
  assert.match(html,/href="\/saved\?id=diagnostic-id"/); assert.match(html,/>Copy link<\/button>/);
  assert.doesNotMatch(html,/admin|batch|Past runs/);
});
