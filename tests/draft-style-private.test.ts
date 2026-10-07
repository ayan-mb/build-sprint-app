import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { draftStyleRules } from "../convex/draftStyleRules";

test("draft rules stay unchanged and load only in the server action", () => {
  assert.equal(draftStyleRules, readFileSync("DRAFT_STYLE.md", "utf8"));
  const action = readFileSync("convex/drafts.ts", "utf8");
  assert.match(action, /import \{ draftStyleRules \} from "\.\/draftStyleRules"/);
  assert.match(action, /style = draftStyleRules;/);
  assert.doesNotMatch(action, /fetch\(`\$\{site\}\/DRAFT_STYLE\.md/);
  assert.equal(existsSync("public/DRAFT_STYLE.md"), false);
  assert.equal(existsSync("scripts/publish-draft-style.mjs"), false);
  assert.equal(JSON.parse(readFileSync("package.json", "utf8")).scripts.prebuild, undefined);
});
