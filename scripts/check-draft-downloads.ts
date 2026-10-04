import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { draftExport } from "../src/draftExport";
const saved=JSON.parse(readFileSync("/tmp/build-sprint-saved-draft.json","utf8"));
assert.equal(readFileSync("/Users/ayanbiswas/Downloads/nbfc-draft.txt","utf8"),draftExport(saved.result.text,"text"));
assert.equal(readFileSync("/Users/ayanbiswas/Downloads/nbfc-draft.md","utf8"),draftExport(saved.result.text,"markdown"));
console.log("PASS: both browser downloads exactly match the saved draft exports, including every placeholder.");
