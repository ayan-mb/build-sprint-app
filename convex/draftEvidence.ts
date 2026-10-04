export const draftTopics = [
  { key: "eligibility", heading: "Credit score eligibility", missing: "eligibility for this borrower question", pattern: /cibil|credit score|credit rating/i },
  { key: "rates", heading: "Interest rate and APR", missing: "interest rate and APR", pattern: /interest|annual percentage|\bAPR\b/i },
  { key: "processing", heading: "Processing fee", missing: "processing fee", pattern: /processing (fee|charge)/i },
  { key: "documents", heading: "Income and documents", missing: "income requirements and documents", pattern: /income|salary|documents|identity|KYC/i },
  { key: "timing", heading: "Approval and disbursal", missing: "approval and disbursal conditions", pattern: /approval|approved|disburs/i },
  { key: "amount", heading: "Loan amount and tenure", missing: "loan amount and tenure", pattern: /loan amount|tenure|repayment period/i },
  { key: "prepayment", heading: "Prepayment and other charges", missing: "prepayment and other charges", pattern: /prepayment|foreclosure|penalt|late payment|additional charge/i },
  { key: "gaps", heading: "Details for reported content gaps", missing: "details for reported content gaps", pattern: /./ },
  { key: "disclaimer", heading: "Conditions and disclosures", missing: "approved product disclaimer", pattern: /terms|conditions|subject to|disclaimer|\bAPR\b/i },
] as const;
export type Fact = { id: number; sheetLine: number; text: string };
export const numericTokens = (text: string) => [...text.matchAll(/\d+(?:,\d{2,3})*(?:\.\d+)?%?|\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|lakh|lakhs|crore|crores)\b/gi)].map(m => m[0]);
export const navigationText = /apply now|view rates\s*&?\s*charges|check your eligibility|how to apply|step \d/i;
export function sheetFacts(sheet: string): Fact[] {
  const facts: Fact[] = [];
  sheet.split(/\r?\n/).forEach((line, index) => {
    // Split long paragraphs only at sentence boundaries, never inside decimal numbers.
    for (const text of line.replace(/Apply Now|View Rates\s*&?\s*Charges/gi, "").split(/(?<=[.!?])\s+(?=[A-Z])|\s+(?=Check Your Eligibility Documents Required|Documents Required for Personal Loan|How to Apply for Personal Loan|Factors That Affect Your Personal Loan Eligibility|Identity and Age Proof|Address Proof|Income and Financial Proof|For Salaried Individuals:|Employment ID card|Step \d)/).map(s => s.trim()).filter(Boolean)) {
      // Long, unsplit blocks cannot become a whole draft; request more usable facts instead.
      if (text.length <= 1600 && !/\[add:|ignore (previous|all)|system prompt|guaranteed approval|100% approval|^Step \d|^How to Apply|^Check Your Eligibility/i.test(text))
        facts.push({ id: facts.length, sheetLine: index + 1, text });
    }
  });
  return facts;
}
export function assembleDraft(
  sheet: string,
  selections: { topic: string; factIds: number[] }[],
  gapTopics: string[],
) {
  const facts = sheetFacts(sheet);
  const lines = ["# Personal loan information", "", "## Credit score eligibility"];
  const numbers: { number: string; draftLine: number; sheetLine: number; passage: string }[] = [];
  const placeholders: string[] = [];
  for (const topic of draftTopics) {
    if (topic.key === "gaps" && !gapTopics.length) continue;
    if (topic.key !== "eligibility") lines.push("", `## ${topic.heading}`);
    const requested = selections.filter(s => s.topic === topic.key).flatMap(s => s.factIds);
    const selected = [...new Set(requested)].slice(0, 3).map(id => facts[id]).filter((fact): fact is Fact => !!fact && topic.pattern.test(fact.text));
    for (const fact of selected) {
      lines.push(`- ${fact.text}`);
      for (const number of numericTokens(fact.text)) numbers.push({ number, draftLine: lines.length, sheetLine: fact.sheetLine, passage: fact.text });
    }
    // Eligibility always needs explicit review for the exact borrower question, rather than an inferred approval promise.
    if (!selected.length || topic.key === "eligibility" || topic.key === "gaps") {
      const labels = topic.key === "gaps" ? gapTopics.map(t => t.replace(/\d+(?:\.\d+)?%?/g, "").replace(/[^a-zA-Z ,/&-]/g, "").trim().slice(0, 100) || topic.missing) : [topic.missing];
      for (const label of labels) {
        const placeholder = `[add: ${label}]`;
        placeholders.push(placeholder);
        lines.push(placeholder);
      }
    }
  }
  return { text: lines.join("\n"), numbers, placeholders };
}


export type DraftSentence = { text: string; topic: string; factIds: number[] };
export function validateProductTerms(sheet: string, terms: string[]) {
  const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9%]+/g, " ").trim();
  const source = ` ${normalize(sheet)} `;
  for (const term of terms) {
    if (!term.trim() || !source.includes(` ${normalize(term)} `)) throw new Error("Unsupported product term");
  }
}
export function assembleProse(sheet: string, sentences: DraftSentence[], gapTopics: string[], question: string) {
  const facts = sheetFacts(sheet);
  const lines: string[] = [];
  const numbers: { number: string; draftLine: number; sheetLine: number; passage: string }[] = [];
  const placeholders: string[] = [];
  const covered = new Set<string>();
  // Explain the mismatch without copying an unsupported number from the question.
  const requested = question.match(/(?:under|below|less than)\s+(\d+)/i);
  const preferred = facts.find(f => /cibil|credit score/i.test(f.text) && /preferred/i.test(f.text));
  const threshold = preferred?.text.match(/(?:cibil(?: score)?|credit score)\s*:\s*(\d+)/i);
  if (requested && threshold && Number(requested[1]) < Number(threshold[1])) {
    lines.push("The fact sheet prefers a higher CIBIL score than the question asks about. It does not confirm eligibility for the requested lower score.");
  }
  for (const sentence of sentences) {
    const text = sentence.text.trim();
    const topic = draftTopics.find(t => t.key === sentence.topic);
    const cited = [...new Set(sentence.factIds)].map(id => facts[id]);
    if (!topic) throw new Error("Unknown draft topic");
    if (!cited.length) throw new Error("Missing fact-sheet reference");
    if (cited.some(f => !f)) throw new Error("Unknown fact-sheet reference");
    if (!text || /[\r\n]|^[-#*]|\[add:/.test(text) || navigationText.test(text)) throw new Error("Invalid draft prose");
    const tokens = numericTokens(text);
    const remaining = cited.flatMap(f => numericTokens(f.text).map(number => ({ number, fact: f })));
    for (const number of tokens) {
      const index = remaining.findIndex(n => n.number === number);
      if (index < 0) throw new Error("Unsupported draft number");
      const { fact } = remaining[index];
      numbers.push({ number, draftLine: lines.length + 1, sheetLine: fact.sheetLine, passage: sheet.split(/\r?\n/)[fact.sheetLine - 1] });
    }
    lines.push(text);
    covered.add(topic.key);
  }
  for (const topic of draftTopics) {
    if (topic.key === "gaps") {
      for (const gap of gapTopics) {
        const label = gap.replace(/\d+(?:\.\d+)?%?/g, "").replace(/[^a-zA-Z ,/&-]/g, "").trim().slice(0, 100);
        const placeholder = `[add: ${label || topic.missing}]`;
        placeholders.push(placeholder); lines.push(placeholder);
      }
    } else if (!covered.has(topic.key) || topic.key === "eligibility") {
      const placeholder = `[add: ${topic.missing}]`;
      placeholders.push(placeholder); lines.push(placeholder);
    }
  }
  return { text: lines.join("\n"), numbers, placeholders };
}
