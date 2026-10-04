// Each comparison is isolated; no saved conversation history is fetched or written.
export function comparisonContext() {
  return { userId: crypto.randomUUID() };
}
