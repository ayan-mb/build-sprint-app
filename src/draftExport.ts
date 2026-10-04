export type DraftFormat = "text" | "markdown";
export function draftExport(text: string, format: DraftFormat) {
  if (format === "text") return text;
  const escape = (line: string) => line.replace(/[\\`*_{}<>#]/g, "\\$&");
  return `# Draft\n\n${text.split(/\r?\n/).map(escape).join("\n\n")}\n`;
}
export async function copyDraft(text: string, format: DraftFormat) {
  await navigator.clipboard.writeText(draftExport(text,format));
}
export function downloadDraft(text: string, format: DraftFormat) {
  const blob=new Blob([draftExport(text,format)],{type:format==="text" ? "text/plain;charset=utf-8" : "text/markdown;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a"); link.href=url; link.download=`nbfc-draft.${format==="text" ? "txt" : "md"}`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
