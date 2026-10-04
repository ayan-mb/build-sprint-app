import { test } from "node:test";
import assert from "node:assert/strict";
import { Agent } from "@convex-dev/agent";
import { createOpenAI } from "@ai-sdk/openai";
import { components } from "../convex/_generated/api";
import { comparisonContext } from "../convex/comparisonContext";
const agent = new Agent(components.agent, {
  name: "Comparison fixture",
  languageModel: createOpenAI({ apiKey: "unused-test-placeholder" })("gpt-4.1-mini"),
});
const ctx = { runQuery: () => { throw new Error("Unexpected database call"); }, runMutation: () => { throw new Error("Unexpected database call"); } } as any;
test("reproduces original comparison failure before any provider or database request", async () => {
  await assert.rejects(agent.start(ctx, { prompt: "Compare supplied captures" }, { storageOptions: { saveMessages: "none" } }, "generateObject"), /Specify userId or threadId/);
});

test("isolated comparison context passes real Agent preparation without accessing saved history", async () => {
  const first = comparisonContext();
  const second = comparisonContext();
  assert.notEqual(first.userId, second.userId);
  const prepared = await agent.start(ctx, { prompt: "Compare supplied captures" }, { ...first, storageOptions: { saveMessages: "none" } }, "generateObject");
  assert.equal(prepared.args.messages[0].role, "user");
  assert.equal(prepared.userId, first.userId);
  assert.deepEqual(prepared.getSavedMessages(), []);
});
