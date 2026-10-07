import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { flaggedWords } from "../convex/draftStyle";
test("editable banned list flags phrases and inflections without flagging placeholders or word fragments", () => {
  const style = "## Banned words and phrases\n- unlock\n- empower\n- seamless\n- game-changer\n- Moreover\n- innovative\n- It's worth noting";
  assert.deepEqual(flaggedWords(style, "Unlocking loans seamlessly is a game-changer. Moreover, empowerment helps."), ["unlock", "empower", "seamless", "game-changer", "Moreover"]);
  assert.deepEqual(flaggedWords(style, "Chair repairs. [add: innovative product facts]"), []);
  assert.deepEqual(flaggedWords(style + "\n- magic\n", "Magic appears here."), ["magic"]);
  assert.deepEqual(flaggedWords(style, "It's worth noting the innovation."), ["innovative", "It's worth noting"]);
});

test("current style prose list supplies banned words", () => {
  const style = readFileSync("DRAFT_STYLE.md", "utf8");
  assert.deepEqual(flaggedWords(style, "Unlocking loans seamlessly is a game-changer. Empowerment helps."), ["unlock", "empower", "seamless", "game-changer"]);
});
