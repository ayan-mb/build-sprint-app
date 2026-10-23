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

import { begin as beginDiagnostic } from "../convex/diagnostics";
import { begin as beginBatch } from "../convex/batches";

test("diagnostic start enforces the admin session before any side effects", async () => {
  const previous = process.env.ADMIN_PASSCODE;
  process.env.ADMIN_PASSCODE = "diagnostic-test-passcode";
  const adminToken = "valid-admin-session-fixture";
  const token = "11111111-1111-1111-1111-111111111111";
  const args = { question: "Which lenders offer personal loans?", website: "https://example.com/loan", token };
  const hash = await digest(adminToken);
  let stored: any = { hash, passcodeHash: await digest(process.env.ADMIN_PASSCODE), expiresAt: Date.now() + 3600000 };
  const writes: any[] = [];
  const scheduled: any[] = [];
  const reads: string[] = [];
  const ctx: any = { db: {
    query: (table: string) => {
      reads.push(table);
      return { withIndex: (_index: string, select: any) => {
        let value: string;
        select({ eq: (_field: string, selected: string) => { value = selected; } });
        return {
          unique: async () => table === "adminSessions" && value === stored?.hash ? stored : null,
          order: () => ({ first: async () => null }),
        };
      } };
    },
    insert: async (table: string, value: any) => { writes.push({ table, value }); return table === "diagnostics" ? "diagnostic-fixture" : "limit-fixture"; },
    patch: async () => { assert.fail("No existing limits in this fixture"); },
  }, runMutation: async (...call: any[]) => { scheduled.push(call); return "workflow-fixture"; } };
  try {
    for (const supplied of [undefined, "", token, "forged-admin-session"]) {
      await assert.rejects((beginDiagnostic as any)._handler(ctx, { ...args, adminToken: supplied }), /Admin sign-in required/);
    }
    stored.expiresAt = Date.now() - 1;
    await assert.rejects((beginDiagnostic as any)._handler(ctx, { ...args, adminToken }), /Admin sign-in required/);
    stored.expiresAt = Date.now() + 3600000;
    stored.passcodeHash = await digest("old-passcode");
    await assert.rejects((beginDiagnostic as any)._handler(ctx, { ...args, adminToken }), /Admin sign-in required/);
    stored.passcodeHash = await digest(process.env.ADMIN_PASSCODE);
    delete process.env.ADMIN_PASSCODE;
    await assert.rejects((beginDiagnostic as any)._handler(ctx, { ...args, adminToken }), /Admin sign-in required/);
    process.env.ADMIN_PASSCODE = "diagnostic-test-passcode";
    assert.equal(writes.length, 0);
    assert.equal(scheduled.length, 0);
    assert.ok(reads.every(table => table === "adminSessions"));

    // Workflow start creates a callback handle through a Convex syscall.
    // Stub only that syscall, and reject any unexpected backend operation.
    const globals = globalThis as any;
    const previousConvex = globals.Convex;
    let id: string;
    try {
      globals.Convex = { asyncSyscall: async (operation: string) => {
        assert.equal(operation, "1.0/createFunctionHandle");
        return JSON.stringify("function://fixture-callback");
      } };
      id = await (beginDiagnostic as any)._handler(ctx, { ...args, adminToken });
    } finally {
      if (previousConvex === undefined) delete globals.Convex;
      else globals.Convex = previousConvex;
    }
    assert.equal(id, "diagnostic-fixture");
    assert.deepEqual(writes.map(write => write.table), ["limits", "diagnostics"]);
    assert.equal(writes[0].value.name, "diagnostics");
    assert.equal(writes[1].value.token, token);
    assert.equal(writes[1].value.adminToken, undefined);
    assert.equal(scheduled.length, 1); // Stubbed workflow only; no provider or network calls.
    assert.doesNotMatch(JSON.stringify(scheduled), /valid-admin-session-fixture/);
  } finally {
    if (previous === undefined) delete process.env.ADMIN_PASSCODE;
    else process.env.ADMIN_PASSCODE = previous;
  }
});

test("administrative batch start also rejects unauthenticated callers before work", async () => {
  await assert.rejects((beginBatch as any)._handler({}, {
    domain: "example.com", questions: ["Which lenders offer personal loans?"],
    token: "11111111-1111-1111-1111-111111111111",
  }), /Admin sign-in required/);
});
