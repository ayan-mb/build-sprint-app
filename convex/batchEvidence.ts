import { publicUrl, normalizeUrl } from "./evidence";
import type { BatchRow } from "./batchValidators";
export function batchInput(domain: string, input: string[]) {
  const raw = domain.trim();
  const url = new URL(publicUrl(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`));
  if (url.pathname !== "/" || url.search || url.hash) throw new Error("Enter a website domain, such as tatacapital.com, without a page path.");
  const questions = input.map(q => q.trim());
  if (!questions.length || questions.length > 20) throw new Error("Use between 1 and 20 borrower questions. The hard limit is 20.");
  if (questions.some(q => q.length < 10 || q.length > 600 || /[\r\n]/.test(q))) throw new Error("Each question must be on its own line and contain 10 to 600 characters.");
  return { domain: url.hostname.toLowerCase().replace(/^www\./, ""), website: url.origin, questions };
}
const plainAnswer = (text: string) => text.replace(/https?:\/\/[^\s)\]]+/gi, "");
export function verifiedNames(text: string, names: string[]) {
  const plain = plainAnswer(text).toLowerCase();
  const result = new Map<string, string>();
  for (const name of names) {
    const clean = name.trim();
    if (!clean || clean.length > 100 || /[\r\n<>]/.test(clean)) throw new Error("Lender analysis returned an invalid name.");
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i").test(plain)) throw new Error("Lender analysis returned a name absent from the answer text.");
    const key = clean.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!result.has(key)) result.set(key, clean);
  }
  return [...result.values()];
}
export function resolveLenders(text: string, entries: { name: string; canonicalName: string }[]) {
  verifiedNames(text, entries.map(e => e.name));
  const mentions = entries.map(entry => {
    const canonicalName = entry.canonicalName.trim();
    if (!canonicalName || canonicalName.length > 100 || /[\r\n<>]/.test(canonicalName)) throw new Error("Lender analysis returned an invalid canonical name.");
    return { name: entry.name.trim(), canonicalName };
  });
  return { lenders: [...new Set(mentions.map(m => m.canonicalName))], lenderMentions: mentions };
}
export function citedDomains(row: BatchRow) {
  const urls = new Set<string>();
  const domains: string[] = [];
  for (const source of row.answer?.sources || []) {
    if (!source.cited) continue;
    try {
      const url = normalizeUrl(source.url);
      if (urls.has(url)) continue;
      urls.add(url);
      domains.push(new URL(url).hostname.toLowerCase().replace(/^www\./, ""));
    } catch { /* Invalid links never count. */ }
  }
  return domains;
}
export function batchSummary(rows: BatchRow[]) {
  const lenders = new Map<string, { name: string; count: number }>();
  const domains = new Map<string, number>();
  for (const row of rows) {
    if (row.status === "complete") {
      const seen = new Set<string>();
      for (const name of row.lenders) {
        const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (seen.has(key)) continue;
        seen.add(key);
        const old = lenders.get(key);
        lenders.set(key, { name: old?.name || name, count: (old?.count || 0) + 1 });
      }
    }
    for (const domain of citedDomains(row)) domains.set(domain, (domains.get(domain) || 0) + 1);
  }
  return {
    completed: rows.filter(r => r.status === "complete").length,
    failed: rows.filter(r => r.status === "error").length,
    brand: rows.filter(r => r.status === "complete" && r.brandMention).length,
    lenders: [...lenders.values()].sort((a,b) => b.count-a.count || a.name.localeCompare(b.name)),
    domains: [...domains].map(([domain,count]) => ({ domain,count })).sort((a,b) => b.count-a.count || a.domain.localeCompare(b.domain)),
  };
}
export function batchLog(domain: string, rows: BatchRow[]) {
  const summary = batchSummary(rows);
  const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ");
  return [
    `Domain: ${domain}`, `Questions: ${rows.length}; completed: ${summary.completed}; failed: ${summary.failed}.`,
    `Answers naming your brand: ${summary.brand} of ${summary.completed} completed answers.`,
    `Other lenders named (answers per lender): ${summary.lenders.map(l => `${l.name}: ${l.count}`).join("; ") || "None"}.`,
    `Most-cited source domains (distinct cited links per answer): ${summary.domains.map(d => `${d.domain}: ${d.count}`).join("; ") || "None"}.`, "",
    "| Question | Status | Your brand named | Other lenders named | Cited links | Source domains | Error |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map(r => `| ${cell(r.question)} | ${r.status} | ${r.brandMention === null ? "Not available" : r.brandMention ? "Yes" : "No"} | ${cell(r.lenders.join(", ") || "—")} | ${citedDomains(r).length} | ${cell([...new Set(citedDomains(r))].join(", ") || "—")} | ${cell(r.error || "—")} |`),
  ].join("\n");
}
