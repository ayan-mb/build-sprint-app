import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { appendFileSync } from "node:fs";
import assert from "node:assert/strict";
const client = new ConvexHttpClient("https://frugal-moose-32.convex.cloud");
const adminToken = process.env.TEST_ADMIN_TOKEN;
if (!adminToken) throw new Error("TEST_ADMIN_TOKEN must contain a valid admin session token.");
const token = crypto.randomUUID();
const question = "best personal loans for CIBIL under 700";
const website = "https://www.tatacapital.com/personal-loan.html";
const id = await client.mutation(api.diagnostics.begin, { token, question, website, adminToken });
console.log("Started one live test:", id);
let run = await client.query(api.diagnostics.current, { token });
const deadline = Date.now() + 240000;
while (run?.status === "running" && Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  run = await client.query(api.diagnostics.current, { token });
}
assert.equal(run?.status, "complete");
const report = run!.result!;
assert.equal(report.answers.length, 1);
const answer = report.answers[0];
assert.equal(answer.provider, "ChatGPT");
const cited = answer.sources.filter((source) => source.cited);
const section = `\n## ChatGPT-only milestone 1 — production live test\n\nDate: ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata" })} (India time).\n\nDeployed with \`npm run deploy\` to https://frugal-moose-32.convex.site.\nRun ID: ${id}\nQuestion: ${question}\nNBFC page: ${website}\nChatGPT status: ${answer.status}\nModel: ${answer.model}\n\nFirst 3 lines of the ChatGPT answer (blank lines preserved):\n\n\`\`\`text\n${answer.text ? answer.text.split("\n").slice(0, 3).join("\n") : "Not available. " + answer.message}\n\`\`\`\n\nEvery cited URL exactly as returned (annotation order; repetitions preserved):\n\n\`\`\`text\n${answer.citedUrls?.join("\n") || "Citation Not Available. No cited URLs returned."}\n\`\`\`\n\nCounts shown by the report:\n- Provider citation links: ${cited.length}\n- To your website: ${cited.filter((source) => source.ownWebsite).length}\n- Findings to review: ${report.gaps.filter((gap) => gap.kind === "missing").length}\n- Cited page captures: ${report.sourcePages.length}\n\nPage reading: ${report.brandPage.status}; ${report.brandPage.text.length} characters captured${report.brandPage.truncated ? " (shortened)" : ""}.\nAI comparison: ${report.comparisonStatus}\nWarnings:\n${report.warnings.map((warning) => "- " + warning).join("\n") || "- None."}\n\nChecks: Type checking passed; all 15 tests passed; production build and deployment passed; hosted HTML and assets checked. Browser clicks and visual layout were not tested because no browser was available. Exactly one live diagnostic was started; no paid retry was made. Milestone 2 was not started.\n\nNext step: review the cited passages and findings in the live diagnostic.\n`;
appendFileSync("BUILD_LOG.md", section);
console.log(section);
