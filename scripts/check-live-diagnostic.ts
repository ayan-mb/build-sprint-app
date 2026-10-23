import { ConvexHttpClient } from "convex/browser";
import { loadEnv } from "vite";
import { api } from "../convex/_generated/api";
import assert from "node:assert/strict";
const env = loadEnv("development", process.cwd(), "");
const url =
  process.env.TEST_CONVEX_URL || env.CONVEX_URL || env.VITE_CONVEX_URL;
if (!url) throw new Error("Convex URL missing.");
const client = new ConvexHttpClient(url);
const config = await client.action(api.research.configuration, {});
console.log("Provider configuration:", JSON.stringify(config));
assert.deepEqual(
  config,
  { openai: false },
  "This no-key smoke test must not spend API credits.",
);
const adminToken = process.env.TEST_ADMIN_TOKEN;
if (!adminToken) throw new Error("TEST_ADMIN_TOKEN must contain a valid admin session token.");
const token = crypto.randomUUID();
const id = await client.mutation(api.diagnostics.begin, {
  adminToken,
  question:
    "Which NBFCs offer personal loans for a CIBIL score under 700, and what are their processing fees?",
  website: "https://www.tatacapital.com/personal-loan.html",
  token,
});
console.log("Started single-question diagnostic:", id);
let run = await client.query(api.diagnostics.current, { token });
const deadline = Date.now() + 65000;
while (run?.status === "running" && Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 1000));
  run = await client.query(api.diagnostics.current, { token });
}
assert.equal(run?.status, "complete");
const result = run!.result!;
assert.equal(result.answers.length, 1);
for (const answer of result.answers) {
  assert.equal(answer.status, "key_missing");
  assert.equal(answer.sources.length, 0);
  assert.match(answer.message, /Key missing/);
}
assert.equal(result.gaps.length, 0);
assert.equal(result.brandPage.status, "read");
assert.ok(result.brandPage.text.length > 1000);
console.log(
  JSON.stringify(
    {
      status: run!.status,
      brandPage: result.brandPage.status,
      capturedCharacters: result.brandPage.text.length,
      brandPageTitle: result.brandPage.title,
      providers: result.answers.map((a) => ({
        provider: a.provider,
        status: a.status,
        message: a.message,
      })),
      verifiedCitations: 0,
      gaps: result.gaps.length,
      comparisonStatus: result.comparisonStatus,
      warnings: result.warnings,
    },
    null,
    2,
  ),
);
assert.equal(
  await client.query(api.diagnostics.current, { token: crypto.randomUUID() }),
  null,
);
console.log("PASS: another session cannot read this run.");
await assert.rejects(() =>
  client.mutation(api.diagnostics.begin, {
    adminToken,
    question: "Which lender has personal loans?",
    website: "http://127.0.0.1",
    token: crypto.randomUUID(),
  }),
);
console.log("PASS: private website URL rejected.");
await assert.rejects(() =>
  client.mutation(api.diagnostics.begin, {
    adminToken,
    question: "Which lender has personal loans?",
    website: "https://www.tatacapital.com/personal-loan.html",
    token,
  }),
);
console.log("PASS: repeated run inside 30 seconds rejected.");
console.log(
  "PASS: full Convex no-key diagnostic completed without fabricated answers, citations, or gaps.",
);
