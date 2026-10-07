export function bannedWords(style: string) {
  const inline = style.match(/^- Words and phrases:\s*(.+)$/m)?.[1];
  if (inline) return inline.replace(/[“”"]/g, "").replace(/\.$/, "").split(/,\s*/).map(w => w.trim()).filter(Boolean);
  const section = style.split("## Banned words and phrases")[1] || "";
  return section.split(/\r?\n/).filter(line => /^- /.test(line)).map(line => line.slice(2).trim()).filter(Boolean);
}
const normalize = (text: string) => text.toLowerCase().replace(/[’‘]/g, "'").replace(/[—–-]/g, " ").replace(/\s+/g, " ");
export function flaggedWords(style: string, draft: string) {
  const text = normalize(draft.replace(/\[add:[^\]]*\]/g, ""));
  return bannedWords(style).filter(word => {
    const plain = normalize(word);
    if (plain === "whether you're a x or a y") return /\bwhether you're (?:a|an) .+ or (?:a|an)\b/.test(text);
    const escaped = plain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const stem = /^[a-z]+$/.test(plain) ? escaped.replace(/e$/, "") : escaped;
    const pattern = /^[a-z]+$/.test(plain) ? `${escaped}(?:s|es|ed|ing|ment|ments|ness|ly|ation|ations)?|${stem}(?:ing|ed|es)|${escaped.replace(/ive$/, "")}(?:ion|ions)` : escaped;
    return new RegExp(`\\b(?:${pattern})\\b`, "i").test(text);
  });
}
