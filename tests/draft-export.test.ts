import { test } from "node:test";
import assert from "node:assert/strict";
import { draftExport } from "../src/draftExport";
import { numericTokens } from "../convex/draftEvidence";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DraftOutput } from "../src/DraftBox";
test("plain text remains exact and Markdown preserves approved terms and missing-fact placeholders",()=>{
  const text="Rates start at 10.99% p.a.*\n[add: APR]\nFees are up to 5%, plus taxes.";
  assert.equal(draftExport(text,"text"),text);
  const md=draftExport(text,"markdown");
  assert.match(md,/^# Draft\n\n/); assert.match(md,/\[add: APR\]/);
  assert.deepEqual(numericTokens(md),numericTokens(text));
  assert.match(md,/p\.a\.\\\*/);
});
test("a ready saved draft offers all four export controls; a failed draft offers none",()=>{
  const ready={status:"ready" as const,text:"[add: eligibility]",numbers:[],placeholders:["[add: eligibility]"],model:"fixture",message:"Review"};
  const html=renderToStaticMarkup(createElement(DraftOutput,{draft:ready}));
  for(const label of ["Copy plain text","Copy Markdown","Download plain text","Download Markdown"]) assert.ok(html.includes(label));
  assert.ok(!renderToStaticMarkup(createElement(DraftOutput,{draft:{...ready,status:"unavailable"}})).includes("Download"));
});
