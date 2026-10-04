import { appendFileSync } from "node:fs";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { api } from "../convex/_generated/api";
import { batchLog } from "../convex/batchEvidence";
import { OPENAI_MODEL } from "../convex/models";
import { BatchResults } from "../src/BatchScreen";
const token = randomUUID();
const questions = [
  "best personal loans for CIBIL under 700",
  "Which lenders offer personal loans for salaried employees in India?",
  "Which lenders offer personal loans with low processing fees in India?",
  "Which lenders offer personal loans with flexible repayment tenure in India?",
  "Which lenders offer personal loans with online applications in India?",
];
assert.equal(questions.length,5);
const client = new ConvexHttpClient("https://frugal-moose-32.convex.cloud");
await client.mutation(api.batches.begin, { domain: "tatacapital.com", questions, token });
let lastStage = "";
const deadline = Date.now() + 12*60*1000;
while (Date.now() < deadline) {
  const batch = await client.query(api.batches.current,{token});
  assert.ok(batch);
  assert.equal(batch.rows.length,5);
  assert.ok(batch.rows.filter(r => r.status === "running").length <= 1);
  for (let index=1; index<batch.rows.length; index++) {
    if (batch.rows[index].status !== "pending") assert.ok(["complete","error"].includes(batch.rows[index-1].status));
  }
  if (batch.stage !== lastStage) { console.log(batch.stage); lastStage=batch.stage; }
  if (batch.status !== "running") {
    assert.equal(batch.status,"complete");
    assert.ok(batch.rows.every(r => r.status === "complete" || r.status === "error"));
    assert.ok(batch.rows.some(r => r.status === "complete"),"No completed answers were available");
    for (const row of batch.rows) if (row.answer) assert.equal(row.answer.model,OPENAI_MODEL);
    assert.equal(await client.query(api.batches.current,{token:randomUUID()}),null);
    const html = renderToStaticMarkup(createElement(BatchResults,{batch}));
    assert.equal((html.match(/<tr>/g)||[]).length,6);
    assert.ok(html.includes("Batch complete"));
    const section = `\n${batchLog(batch.domain,batch.rows)}\n`;
    appendFileSync("BUILD_LOG.md",section);
    console.log(section);
    process.exit(0);
  }
  await new Promise(resolve => setTimeout(resolve,1500));
}
throw new Error("Batch test exceeded its time limit. No automatic paid retry was made.");
