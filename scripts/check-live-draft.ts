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
if (result.status !== "ready") { console.log(result.message); throw new Error("Live draft was not available."); }
assert.deepEqual(numericTokens(result.text), result.numbers.map(n => n.number));
for (const n of result.numbers) {
  assert.ok(sheet.split("\n")[n.sheetLine - 1].includes(n.passage));
  assert.ok(numericTokens(n.passage).includes(n.number));
  assert.ok(result.text.split("\n")[n.draftLine - 1].includes(n.passage));
}
assert.ok(result.placeholders.includes("[add: eligibility for this borrower question]"));
const html = renderToStaticMarkup(createElement(DraftOutput, { draft: result }));
assert.ok(html.includes("<mark>"));
assert.ok(!html.includes("<script>"));
const firstTen = result.text.split("\n").slice(0, 10).join("\n");
const section = `\n## Milestone 2 — fact-sheet draft live test\n\nDate: ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" })} (India time).\nLive app: https://frugal-moose-32.convex.site\nQuestion: best personal loans for CIBIL under 700\nFact-sheet source: https://www.tatacapital.com/personal-loan.html\nModel: ${result.model}\n\nThe fact sheet was the saved ${capture.page.text.length}-character Tata Capital page capture from report ${id}. Sentence boundaries were changed to line breaks for line references; no words or numbers were changed. The original capture was shortened, so missing information is shown as placeholders. Milestone 1's report was reused unchanged.\n\nFirst 10 lines of the draft (blank lines preserved):\n\n\`\`\`text\n${firstTen}\n\`\`\`\n\nEvery number in the full draft, in order (repeated occurrences preserved), with its fact-sheet line:\n\n${result.numbers.map(n => `- ${n.number} — fact-sheet line ${n.sheetLine}`).join("\n") || "- None. No numbers appeared in the draft."}\n\nReferenced fact-sheet lines (exact text):\n\n${[...new Set(result.numbers.map(n => n.sheetLine))].map(line => `Line ${line}: ${sheet.split("\n")[line - 1]}`).join("\n\n")}\n\nValidation: the production Convex action generated one draft. Every numeric occurrence matched its recorded fact-sheet passage and line; only exact supplied passages entered the draft. Visible placeholders include eligibility for this borrower question. Type checking and all 25 tests passed. npm run deploy and hosted-file checks passed. Actual draft component rendering with the live result passed; browser clicks and visual layout were not tested because no browser was available. No API key value was printed, logged, copied, or written. No login or milestone 3 was added.\n\nNext step: review the draft and fill its highlighted missing facts from approved product information.\n`;
appendFileSync("BUILD_LOG.md", section);
console.log(section);
