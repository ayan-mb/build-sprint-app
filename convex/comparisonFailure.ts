// Allow-listed diagnostics only. Never return raw errors, response bodies, or headers.
export function comparisonFailure(error: unknown, stage: string): string {
  const details: string[] = [`stage=${stage}`];
  const kinds = new Set(["AI_APICallError", "AI_NoObjectGeneratedError", "AI_TypeValidationError", "AI_JSONParseError", "AI_UnsupportedFunctionalityError", "TimeoutError", "AbortError", "TypeError", "Error"]);
  const codes = new Set(["invalid_json_schema", "invalid_request_error", "model_not_found", "insufficient_quota", "rate_limit_exceeded", "context_length_exceeded"]);
  let current: any = error;
  for (let i = 0; current && i < 4; i++, current = current.cause) {
    if (kinds.has(current.name)) details.push(`kind=${current.name}`);
    if (Number.isInteger(current.statusCode) && current.statusCode >= 100 && current.statusCode <= 599)
      details.push(`HTTP=${current.statusCode}`);
    let code = current.data?.error?.code;
    try { code ||= JSON.parse(current.responseBody)?.error?.code; } catch { /* No raw output. */ }
    if (codes.has(code)) details.push(`code=${code}`);
    const message = typeof current.message === "string" ? current.message : "";
    if (/maxItems/.test(message)) details.push("field=maxItems");
    if (/Unsupported schema|schema.*not supported|Invalid schema/i.test(message)) details.push("reason=unsupported_schema");
    if (/context.*(length|window)|maximum context/i.test(message)) details.push("reason=context_limit");
    if (/threadId.*required|requires.*thread|Specify userId or threadId/i.test(message)) details.push("reason=thread_required");
    if (/fetch failed/i.test(message)) details.push("reason=network");
  }
  return `AI page comparison not available (${[...new Set(details)].join("; ")}). Evidence-backed topic checks remain available. No automatic paid retry was made.`;
}
