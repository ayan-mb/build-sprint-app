import { test } from "node:test";
import assert from "node:assert/strict";
import { batchInput, batchSummary, verifiedNames, citedDomains, resolveLenders } from "../convex/batchEvidence";
import { runSequential } from "../convex/batchRunner";
import type { BatchRow } from "../convex/batchValidators";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BatchResults } from "../src/BatchScreen";
const row = (): BatchRow => ({ question: "Which lenders offer personal loans?", status: "complete", brandMention: true, lenders: ["Bajaj Finance", "Bajaj Finance"], error: "", answer: { provider: "ChatGPT", model: "fixture", status: "ready", text: "Tata Capital and Bajaj Finance.", message: "", fetchedAt: 0, sources: [
  { url: "https://www.example.com/a?utm_source=test", title: "A", cited: true, ownWebsite: false, reference: "" },
  { url: "https://example.com/a", title: "A duplicate", cited: true, ownWebsite: false, reference: "" },
  { url: "https://www.example.com/a?utm_source=other", title: "A repeat", cited: true, ownWebsite: false, reference: "" },
  { url: "https://search-only.com", title: "Search only", cited: false, ownWebsite: false, reference: "" },
] } });
test("batch hard limit rejects 21 questions before any calls, with domain and question validation", async () => {
  assert.equal(batchInput("tatacapital.com", ["What is a personal loan?"]).domain, "tatacapital.com");
  assert.equal(batchInput("https://www.tatacapital.com/", Array(20).fill("What is a personal loan?")).questions.length, 20);
  assert.throws(() => batchInput("tatacapital.com", Array(21).fill("What is a personal loan?")), /hard limit/);
  assert.throws(() => batchInput("tatacapital.com/path", ["What is a loan?"]), /page path/);
  assert.throws(() => batchInput("localhost", ["What is a loan?"]), /public/);
  assert.throws(() => batchInput("tatacapital.com", ["small"]), /10 to 600/);
  let called = false;
  await assert.rejects(runSequential(Array(21).fill(0), async () => { called=true; }, async () => {}), /20 questions/);
  assert.equal(called,false);
});
test("questions run one at a time and continue after a middle failure", async () => {
  const events: string[] = []; let active=0;
  await runSequential(["first", "failure", "last"], async item => {
    active++; assert.equal(active,1); events.push(item);
    await Promise.resolve(); active--;
    if (item === "failure") throw new Error("fixture provider failure");
  }, async item => { events.push(`error:${item}`); });
  assert.deepEqual(events,["first","failure","error:failure","last"]);
});
test("lender counts are per answer and citations exclude search-only and tracking repeats", () => {
  const first=row(); const second=row(); second.status="error"; second.brandMention=null; second.lenders=[];
  const summary=batchSummary([first,second]);
  assert.equal(summary.brand,1); assert.equal(summary.completed,1); assert.equal(summary.failed,1);
  assert.deepEqual(summary.lenders,[{name:"Bajaj Finance",count:1}]);
  assert.equal(citedDomains(first).length,2);
  assert.deepEqual(summary.domains,[{domain:"example.com",count:4}]);
});
test("names must actually appear in answer prose; URLs and lookalike fragments do not count", () => {
  assert.deepEqual(verifiedNames("Tata Capital and Bajaj Finance; Tata Capital again.",["Tata Capital","Tata Capital","Bajaj Finance"]),["Tata Capital","Bajaj Finance"]);
  assert.throws(() => verifiedNames("https://example.com/Tata Capital",["Tata"]), /absent/);
  assert.throws(() => verifiedNames("NotBajaj Finance",["Bajaj Finance"]), /absent/);
});
test("batch screen shows all rows, visible progress and a failed question's error", () => {
  const first=row(); const failed=row(); failed.status="error"; failed.brandMention=null; failed.lenders=[]; failed.error="Provider request failed";
  const html=renderToStaticMarkup(createElement(BatchResults,{batch:{_id:"fixture" as any,_creationTime:0,domain:"tatacapital.com",questions:[first.question,failed.question],rows:[first,failed],createdAt:0,status:"running",stage:"Question 2 of 2"}}));
  assert.match(html,/progress/); assert.match(html,/Question 2 of 2/); assert.match(html,/Provider request failed/);
  assert.equal((html.match(/<tr>/g)||[]).length,3); assert.match(html,/1 of 1 completed answers/);
});

test("alternate written names count as one evidenced institution across answers", () => {
  const first=row(); const second=row();
  Object.assign(first,resolveLenders("HDFC Bank Limited",[{name:"HDFC Bank Limited",canonicalName:"HDFC Bank"}]));
  Object.assign(second,resolveLenders("HDFC Bank",[{name:"HDFC Bank",canonicalName:"HDFC Bank"}]));
  assert.deepEqual(batchSummary([first,second]).lenders,[{name:"HDFC Bank",count:2}]);
  assert.equal(first.lenderMentions?.[0].name,"HDFC Bank Limited");
  assert.throws(() => resolveLenders("HDFC Bank",[{name:"Invented Bank",canonicalName:"Invented Bank"}]),/absent/);
});
