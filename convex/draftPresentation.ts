import type { DraftSentence } from "./draftEvidence";
import { assembleProse } from "./draftEvidence";
export type DraftBlock = DraftSentence & { kind: "title" | "heading" | "paragraph" };
export function fillDraftInputs(style: string, inputs: { brand: string; website: string; question: string; factSheet: string }) {
  return style.replace(/^- Brand:.*$/m, () => `- Brand: ${inputs.brand}`)
    .replace(/^- Brand website:.*$/m, () => `- Brand website: ${inputs.website}`)
    .replace(/^- Topic:.*$/m, () => `- Topic: ${inputs.question}`)
    .replace(/^- Fact sheet:.*$/m, () => `- Fact sheet: ${inputs.factSheet || "Not pasted; use supplied brand pages."}`);
}
export function presentDraft(sheet: string, blocks: DraftBlock[], notes: string[], citations: string[]) {
  for (const block of blocks) {
    if (/https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|in|org|net|io|co)\b|\[VERIFY|\[add:/i.test(block.text)) throw new Error("Invalid draft prose");
  }
  // Reuse the existing evidence and number checks without changing their rules.
  const checked = assembleProse(sheet, blocks, [], "");
  const text = blocks.map(b => `${b.kind === "title" ? "# " : b.kind === "heading" ? "## " : ""}${b.text.trim()}`).join("\n\n");
  const numbers = checked.numbers.map(n => ({ ...n, draftLine: (n.draftLine - 1) * 2 + 1 }));
  const verificationNotes = [...new Set(notes.map(n => n.replace(/^\[VERIFY(?::\s*)?|\]$/g, "").trim()).filter(Boolean))].map(n => `[VERIFY: ${n}]`);
  return { text: text + (citations.length ? "\n\n## Sources\n" + citations.join("\n") : ""), numbers, placeholders: [], verificationNotes };
}
