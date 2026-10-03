import assert from "node:assert/strict";
const base = "https://frugal-moose-32.convex.site";
const response = await fetch(base, { signal: AbortSignal.timeout(20000) });
assert.equal(response.status, 200);
const html = await response.text();
assert.match(html, /LLM AI/);
const js = html.match(/src="([^"]+\.js)"/)?.[1];
const css = html.match(/href="([^"]+\.css)"/)?.[1];
assert.ok(js && css);
for (const path of [js, css]) {
  const res = await fetch(new URL(path!, base), {
    signal: AbortSignal.timeout(20000),
  });
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.ok(body.length > 1000);
  if (path === js) {
    assert.ok(body.includes("https://frugal-moose-32.convex.cloud"));
    assert.ok(!body.includes("https://animated-yak-855.convex.cloud"));
    assert.ok(!body.includes("https://api.openai.com"));
    assert.ok(!body.includes("https://api.perplexity.ai"));
  }
  console.log(`PASS: ${path} HTTP ${res.status}; ${body.length} characters.`);
}
console.log(
  "PASS: hosted HTML is available, both assets load, the app points to production Convex, and provider API endpoints are absent from the browser bundle.",
);
console.log("NOT TESTED: browser clicks or visual layout.");
