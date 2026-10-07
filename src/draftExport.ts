import { markdownHtml, markdownPlainText } from "./MarkdownArticle";
export type DraftFormat = "text" | "markdown";
// Markdown downloads preserve the stored article byte for byte.
export function draftExport(text: string, _format: DraftFormat) {
  return text;
}
export async function copyDraft(text: string): Promise<"rich" | "text"> {
  const plain = markdownPlainText(text);
  if (typeof ClipboardItem !== "undefined" && typeof navigator.clipboard.write === "function") {
    try {
      await navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([markdownHtml(text)], { type: "text/html" }),
        "text/plain": new Blob([plain], { type: "text/plain" }),
      })]);
      return "rich";
    } catch {
      // Some browsers allow plain text but reject HTML clipboard writes.
    }
  }
  await navigator.clipboard.writeText(plain);
  return "text";
}
export function downloadDraft(text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = "nbfc-draft.md";
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
