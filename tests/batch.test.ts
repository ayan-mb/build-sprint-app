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
test("completed rows offer Write Draft in its own column", () => {
  const absent = { ...row(), brandMention: false };
  const unknown = { ...row(), brandMention: null };
  const html = renderToStaticMarkup(createElement(BatchResults, { batch: {
    _id: "fixture" as never, _creationTime: 0, createdAt: 0, domain: "tatacapital.com",
    status: "complete", stage: "Complete", questions: [], rows: [row(), absent, unknown],
  } }));
  assert.equal((html.match(/>Write Draft<\/button>/g) || []).length, 3);
  assert.match(html, /<th scope="col">Write Draft<\/th>/);
});
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
  assert.deepEqual(summary.lenders,[{name:"Bajaj Finance / Bajaj Finserv",count:1}]);
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
  assert.match(html,/progress/); assert.match(html,/2 of 2 prompts finished/); assert.match(html,/Provider request failed/);
  assert.equal((html.match(/<tr>/g)||[]).length,3); assert.match(html,/Your brand/); assert.match(html,/Your Brand Cited/); assert.doesNotMatch(html,/<th scope="col">Error<\/th>/);
});

test("alternate written names count as one evidenced institution across answers", () => {
  const first=row(); const second=row();
  Object.assign(first,resolveLenders("HDFC Bank Limited",[{name:"HDFC Bank Limited",canonicalName:"HDFC Bank"}]));
  Object.assign(second,resolveLenders("HDFC Bank",[{name:"HDFC Bank",canonicalName:"HDFC Bank"}]));
  assert.deepEqual(batchSummary([first,second]).lenders,[{name:"HDFC Bank",count:2}]);
  assert.equal(first.lenderMentions?.[0].name,"HDFC Bank Limited");
  assert.throws(() => resolveLenders("HDFC Bank",[{name:"Invented Bank",canonicalName:"Invented Bank"}]),/absent/);
});

test("merged lender aliases count once per answer and site aliases share a citation total", () => {
  const first=row(); first.lenders=["Bajaj Finance","Bajaj Finserv","ICICI Bank"];
  first.answer!.sources=["https://icici.bank.in/a","https://icicibank.com/b","https://lookalikeicicibank.com/c"].map(url=>({url,title:"source",cited:true,ownWebsite:false,reference:""}));
  const second=row(); second.lenders=["Bajaj Finserv"];
  const summary=batchSummary([first,second]);
  assert.equal(summary.lenders.find(l=>l.name==="Bajaj Finance / Bajaj Finserv")?.count,2);
  assert.equal(summary.lenders.find(l=>l.name==="ICICI Bank")?.count,1);
  assert.equal(summary.domains.find(d=>d.domain==="icici.bank.in / icicibank.com")?.count,2);
  assert.equal(summary.domains.find(d=>d.domain==="lookalikeicicibank.com")?.count,1);
  assert.deepEqual(first.lenders,["Bajaj Finance","Bajaj Finserv","ICICI Bank"]);
});

import { siteIdentity } from "../convex/identities";
test("all observed SBI site aliases and known site subdomains merge without matching lookalikes",()=>{
  assert.equal(siteIdentity("sbi.bank.in"),siteIdentity("bank.sbi"));
  assert.equal(siteIdentity("sbi.co.in"),siteIdentity("bank.sbi"));
  assert.equal(siteIdentity("systemhealth.rbi.org.in"),siteIdentity("rbi.org.in"));
  assert.equal(siteIdentity("www4.kreditbee.in"),siteIdentity("kreditbee.in"));
  assert.notEqual(siteIdentity("notrbi.org.in"),siteIdentity("rbi.org.in"));
});
