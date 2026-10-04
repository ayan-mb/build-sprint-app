import type { Answer, Gap, Page, Source } from "./validators";

export function publicUrl(input: string): string {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    throw new Error("Enter a full public website URL starting with https://.");
  }
  const host = u.hostname.toLowerCase();
  if (
    !["https:", "http:"].includes(u.protocol) ||
    u.username ||
    u.password ||
    (u.port && !["80", "443"].includes(u.port)) ||
    !host.includes(".") ||
    host.endsWith(".local") ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    host.endsWith(".test") ||
    host.endsWith(".invalid") ||
    host.endsWith(".example") ||
    host.endsWith(".home") ||
    host.endsWith(".lan") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host) ||
    host.includes(":") ||
    host.includes("[")
  )
    throw new Error(
      "Use a public website URL, without credentials, private addresses, or custom ports.",
    );
  u.hash = "";
  return u.href;
}
export function ownWebsite(source: string, website: string): boolean {
  try {
    const root = new URL(website).hostname.toLowerCase().replace(/^www\./, "");
    const h = new URL(source).hostname.toLowerCase().replace(/^www\./, "");
    return h === root || h.endsWith("." + root);
  } catch {
    return false;
  }
}
export function normalizeUrl(input: string): string {
  const u = new URL(input);
  u.hash = "";
  for (const key of [...u.searchParams.keys()])
    if (/^utm_|^(fbclid|gclid)$/.test(key)) u.searchParams.delete(key);
  u.searchParams.sort();
  return u.href.replace(/\/$/, "");
}
function safeSource(
  url: unknown,
  title: unknown,
  cited: boolean,
  reference: string,
  website: string,
): Source | null {
  if (typeof url !== "string") return null;
  try {
    const validated = publicUrl(url);
    return {
      url,
      title: typeof title === "string" ? title : validated,
      cited,
      reference,
      ownWebsite: ownWebsite(validated, website),
    };
  } catch {
    return null;
  }
}
// Accept only Responses API citation metadata; preserve returned URLs exactly.
// A URL written into the answer by the model is not proof of a citation.
export function parseAnswer(
  provider: Answer["provider"],
  data: any,
  website: string,
  now = Date.now(),
): Answer {
  const sources: Source[] = [];
  const citedUrls: string[] = [];
  const textParts: string[] = [];
  const add = (s: Source | null) => {
    if (!s) return;
    const old = sources.find(
      (x) => normalizeUrl(x.url) === normalizeUrl(s.url),
    );
    if (old) {
      old.cited ||= s.cited;
      if (s.reference) old.reference = s.reference;
    } else sources.push(s);
  };
  for (const item of data.output ?? [])
    if (item.type === "message" && item.role === "assistant")
      for (const part of item.content ?? [])
        if (part.type === "output_text") {
          if (typeof part.text === "string") textParts.push(part.text);
          for (const annotation of part.annotations ?? [])
            if (annotation.type === "url_citation") {
              if (typeof annotation.url === "string") citedUrls.push(annotation.url);
              add(safeSource(annotation.url, annotation.title, true, "URL citation", website));
            }
        }
  const text = textParts.join("\n\n").slice(0, 24000);
  if (!text.trim()) throw new Error("The provider returned no answer text.");
  const cited = sources.some((s) => s.cited);
  return {
    provider,
    model: typeof data.model === "string" ? data.model : "unknown",
    status: cited ? "ready" : "no_citations",
    text,
    sources,
    citedUrls,
    fetchedAt: now,
    message: cited
      ? ""
      : "Citation Not Available. Search results are shown separately; no citation has been guessed.",
  };
}
export const topics = [
  {
    name: "Credit score eligibility",
    pattern:
      /\bcibil\b|credit score|credit rating|low[- ]credit|poor[- ]credit/i,
  },
  {
    name: "Interest rate / APR",
    pattern: /interest rates?|annual percentage rate|\bapr\b/i,
  },
  { name: "Processing fees", pattern: /processing (?:fee|charge)s?/i },
  {
    name: "Income and documents",
    pattern:
      /salary slips?|income proof|proof of income|income requirement|monthly income|documents? required/i,
  },
  {
    name: "Approval and disbursal time",
    pattern: /approval|disburs(?:al|ement)|turnaround/i,
  },
  {
    name: "Loan amount and tenure",
    pattern: /loan amount|loan tenure|repayment period|repayment tenure/i,
  },
  {
    name: "Prepayment and foreclosure",
    pattern: /prepayment|foreclosure|early repayment/i,
  },
  {
    name: "Fees and charges",
    pattern:
      /hidden (?:fee|charge)|late payment|penalty|penalties|additional charges/i,
  },
];
export function excerpt(text: string, pattern: RegExp): string {
  const m = pattern.exec(text);
  if (!m) return "";
  const start = Math.max(0, text.lastIndexOf(".", m.index - 1) + 1);
  const afterTopic = m.index + m[0].length;
  const boundary = text.slice(afterTopic).search(/[.!?](?=\s|$)/);
  const end = boundary < 0 ? -1 : afterTopic + boundary;
  return text
    .slice(
      start,
      end < 0
        ? Math.min(text.length, m.index + 240)
        : Math.min(end + 1, m.index + 300),
    )
    .trim();
}
export function compareTopics(brand: Page, pages: Page[]): Gap[] {
  if (brand.status !== "read") return [];
  const gaps: Gap[] = [];
  for (const t of topics) {
    for (const p of pages) {
      if (p.status !== "read" || !t.pattern.test(p.text)) continue;
      const brandEvidence = excerpt(brand.text, t.pattern);
      gaps.push({
        topic: t.name,
        kind: brandEvidence
          ? "covered"
          : brand.truncated
            ? "uncertain"
            : "missing",
        sourceUrl: p.url,
        evidence: excerpt(p.text, t.pattern),
        brandEvidence,
        method: "topic_check",
        explanation: brandEvidence
          ? "This topic appears in the fetched NBFC page. Values and eligibility may differ."
          : brand.truncated
            ? "Not found in the captured portion; the page was shortened."
            : "This topic appears in the cited source but was not found in the fetched NBFC page text. This is a topic check, not proof about the whole website.",
      });
    }
  }
  return gaps;
}
export function validateSemantic(
  gaps: Gap[],
  brand: Page,
  pages: Page[],
): Gap[] {
  const squash = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  return gaps
    .filter((g) => {
      const p = pages.find((p) => p.url === g.sourceUrl && p.status === "read");
      if (
        !p ||
        g.evidence.trim().length < 12 ||
        !squash(p.text).includes(squash(g.evidence))
      )
        return false;
      if (
        g.brandEvidence.trim() &&
        !squash(brand.text).includes(squash(g.brandEvidence))
      )
        return false;
      if (g.kind === "covered" && !g.brandEvidence.trim()) return false;
      if (g.kind === "missing" && g.brandEvidence.trim()) return false;
      return true;
    })
    .map((g) => ({
      ...g,
      kind: g.kind === "missing" && brand.truncated ? "uncertain" : g.kind,
      method: "semantic",
    }));
}
