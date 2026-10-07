import { test } from "node:test";
import assert from "node:assert/strict";
import { draftExport } from "../src/draftExport";
import { numericTokens } from "../convex/draftEvidence";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DraftBox, { DraftOutput } from "../src/DraftBox";
import { ConvexProvider, ConvexReactClient } from "convex/react";
test("single-question results expose the fact sheet and Write draft control",()=>{
  const client = new ConvexReactClient("https://example.convex.cloud");
  const html = renderToStaticMarkup(createElement(ConvexProvider,{client},createElement(DraftBox,{
    id:"fixture" as never, token:"fixture", question:"Which loan is available?",
  })));
  assert.match(html,/NBFC product fact sheet/);
  assert.match(html,/>Write draft<\/button>/);
  assert.match(html,/Verification notes/);
  void client.close();
});
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
test("banned-word findings appear alongside the saved draft",()=>{
  const html=renderToStaticMarkup(createElement(DraftOutput,{draft:{status:"ready",text:"Unlock a loan.",numbers:[],placeholders:[],model:"fixture",message:"Review",flaggedWords:["unlock"]}}));
  assert.match(html,/Flagged words: unlock/);
});
