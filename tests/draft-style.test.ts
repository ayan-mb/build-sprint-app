import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { flaggedWords } from "../convex/draftStyle";
test("editable banned list flags phrases and inflections without flagging placeholders or word fragments", () => {
  const style = readFileSync("DRAFT_STYLE.md", "utf8");
  assert.deepEqual(flaggedWords(style, "Unlocking loans seamlessly is a game-changer. Moreover, empowerment helps."), ["unlock", "empower", "seamless", "game-changer", "Moreover"]);
  assert.deepEqual(flaggedWords(style, "Chair repairs. [add: innovative product facts]"), []);
  assert.deepEqual(flaggedWords(style + "\n- magic\n", "Magic appears here."), ["magic"]);
  assert.deepEqual(flaggedWords(style, "It's worth noting the innovation."), ["innovative", "It's worth noting"]);
});
