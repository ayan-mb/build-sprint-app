import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import assert from "node:assert/strict";
import { ConvexHttpClient } from "convex/browser";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { api } from "../convex/_generated/api";
import { numericTokens } from "../convex/draftEvidence";
import { DraftOutput } from "../src/DraftBox";
import type { Id } from "../convex/_generated/dataModel";
const id = "j57fwsrm2fnpgab0jt0j8s0wvh8fma3f" as Id<"diagnostics">;
const capture = JSON.parse(execFileSync("npx", ["convex", "run", "draftData:testCapture", JSON.stringify({ id }), "--prod", "--typecheck=disable", "--codegen=disable"], { encoding: "utf8", timeout: 30000 }));
assert.equal(capture.question, "best personal loans for CIBIL under 700");
assert.equal(capture.page.status, "read");
// Line breaks only: preserve all captured page content and its numbers.
const sheet: string = capture.page.text.replace(/(?<=[.!?])\s+(?=[A-Z])/g, "\n");
const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
assert.equal(normalize(sheet), normalize(capture.page.text));
const client = new ConvexHttpClient("https://frugal-moose-32.convex.cloud");
const result = await client.action(api.drafts.generate, { id, token: capture.token, factSheet: sheet });
let failure = result.status === "ready" ? "" : result.message;
try {
if (failure) throw new Error(failure);
assert.deepEqual(numericTokens(result.text), result.numbers.map(n => n.number));
for (const n of result.numbers) {
  assert.ok(sheet.split("\n")[n.sheetLine - 1].includes(n.passage));
  assert.ok(numericTokens(n.passage).includes(n.number));
  assert.ok(numericTokens(result.text.split("\n")[n.draftLine - 1]).includes(n.number));
}
assert.ok(result.placeholders.includes("[add: eligibility for this borrower question]"));
const html = renderToStaticMarkup(createElement(DraftOutput, { draft: result }));
assert.ok(html.includes("<mark>"));
assert.ok(!html.includes("<script>"));
const firstTen = result.text.split("\n").slice(0, 10).join("\n");
assert.doesNotMatch(result.text, /Apply Now|View Rates\s*&\s*Charges/i);
assert.match(result.text, /higher CIBIL score/);
assert.match(result.text, /725/);
} catch (error) {
  failure = error instanceof Error ? error.message : "Live test assertion failed.";
}
const firstLines = result.text.split("\n").slice(0, 10).join("\n");
const section = `\nModel reported by API: ${result.model || "not reported"}\nPass or fail: ${failure ? "FAIL" : "PASS"}\n${failure ? `Exact failure reason: ${failure}\n` : ""}\nFirst 10 lines of the draft:\n\n\`\`\`text\n${firstLines || "Unavailable: no draft was returned."}\n\`\`\`\n`;
appendFileSync("BUILD_LOG.md", section);
console.log(section);
if (failure) process.exitCode = 1;
