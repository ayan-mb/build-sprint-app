import { test } from "node:test";
import assert from "node:assert/strict";
import { comparisonFailure } from "../convex/comparisonFailure";
test("comparison failures expose safe categories and status without raw sensitive values", () => {
  const sensitive = "fixture-secret-never-output";
  const error = { name: "AI_APICallError", statusCode: 400, message: `Invalid schema: maxItems ${sensitive}`, responseBody: JSON.stringify({ error: { code: "invalid_json_schema", message: sensitive } }), requestHeaders: { Authorization: sensitive } };
  const message = comparisonFailure(error, "generate");
  assert.match(message, /HTTP=400/);
  assert.match(message, /code=invalid_json_schema/);
  assert.match(message, /field=maxItems/);
  assert.doesNotMatch(message, new RegExp(sensitive));
  assert.doesNotMatch(comparisonFailure({ name: sensitive, message: sensitive, data: { error: { code: sensitive } } }, "validate"), new RegExp(sensitive));
});
