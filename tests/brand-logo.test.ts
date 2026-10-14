import { test } from "node:test";
import assert from "node:assert/strict";
import { discoverBrandIcons } from "../convex/brandIcons";

test("brand logo uses the website's declared nested icon rather than guessed root files", () => {
  const icons = discoverBrandIcons('<link rel="shortcut icon" href="/content/dam/tata-capital/images/favicon.ico" type="image/x-icon"/>', "https://www.tatacapital.com/");
  assert.equal(icons[0], "https://www.tatacapital.com/content/dam/tata-capital/images/favicon.ico");
});

test("brand icons resolve page bases, reject unsafe URLs and retain fallback paths", () => {
  const icons = discoverBrandIcons('<base href="/assets/"><link href="brand.png" rel="icon"><link rel="icon" href="javascript:bad"><link rel="icon" href="http://127.0.0.1/private">', "https://brand.com/");
  assert.equal(icons[0], "https://brand.com/assets/brand.png");
  assert.ok(!icons.some(url => /javascript|127\.0\.0\.1/.test(url)));
  assert.ok(icons.includes("https://brand.com/favicon.ico"));
});
