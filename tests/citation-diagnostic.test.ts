import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseAnswer,
  ownWebsite,
  publicUrl,
  compareTopics,
  validateSemantic,
} from "../convex/evidence";
import type { Gap, Page } from "../convex/validators";
const website = "https://www.example.com/personal-loan";
const makePage = (
  text: string,
  url = "https://example.com/personal-loan",
): Page => ({
  url,
  finalUrl: url,
  title: "Fixture page",
  text,
  status: "read",
  message: "Test fixture, not live provider evidence",
  truncated: false,
  fetchedAt: 1,
});
test("ChatGPT uses actual citation metadata, deduplicates tracking URLs, and ignores answer-only links", () => {
  const answer = parseAnswer(
    "ChatGPT",
    {
      model: "fixture",
      choices: [
        {
          message: {
            content: "A source is cited. https://invented.org",
            annotations: [
              {
                type: "url_citation",
                url_citation: {
                  url: "https://www.example.com/rates?utm_source=openai",
                  title: "Rates",
                },
              },
              {
                type: "url_citation",
                url_citation: {
                  url: "https://www.example.com/rates",
                  title: "Rates again",
                },
              },
            ],
          },
        },
      ],
    },
    website,
    1,
  );
  assert.equal(answer.status, "ready");
  assert.equal(answer.sources.length, 1);
  assert.equal(answer.sources[0].ownWebsite, true);
  assert.equal(answer.sources[0].cited, true);
});
test("Perplexity maps numbered answer references to result IDs, not array positions", () => {
  const answer = parseAnswer(
    "Perplexity",
    {
      model: "fixture",
      output: [
        {
          type: "search_results",
          results: [
            { id: 8, url: "https://competitor.com/fees", title: "Fees" },
            { id: 2, url: "https://example.com/loan", title: "Loan" },
            { id: 3, url: "https://aggregator.com/loan", title: "Result only" },
          ],
        },
        {
          type: "message",
          role: "assistant",
          content: [
            { type: "output_text", text: "See fees [8] and eligibility [2]." },
          ],
        },
      ],
    },
    website,
    1,
  );
  assert.equal(answer.sources.filter((s) => s.cited).length, 2);
  assert.equal(answer.sources[0].reference, "[8]");
  assert.equal(answer.sources[2].cited, false);
});
test("Perplexity grouped references and URL annotations both preserve cited sources", () => {
  const answer = parseAnswer(
    "Perplexity",
    {
      output: [
        {
          type: "search_results",
          results: [
            { id: 4, url: "https://competitor.com/fee" },
            { id: 7, url: "https://competitor.com/rate" },
          ],
        },
        {
          type: "message",
          role: "assistant",
          content: [
            {
              type: "output_text",
              text: "Terms [4, 7].",
              annotations: [
                {
                  type: "url_citation",
                  url: "https://example.com/terms",
                  title: "Terms",
                },
              ],
            },
          ],
        },
      ],
    },
    website,
    1,
  );
  assert.equal(answer.sources.filter((s) => s.cited).length, 3);
});
test("An uncited ChatGPT answer produces Citation Not Available without inventing links", () => {
  const a = parseAnswer(
    "ChatGPT",
    { choices: [{ message: { content: "Read https://example.com." } }] },
    website,
    1,
  );
  assert.equal(a.status, "no_citations");
  assert.equal(a.sources.length, 0);
  assert.match(a.message, /Citation Not Available/);
});
test("Unreferenced Perplexity results are not counted as citations", () => {
  const a = parseAnswer(
    "Perplexity",
    {
      output: [
        {
          type: "search_results",
          results: [{ id: 1, url: "https://competitor.com" }],
        },
        {
          type: "message",
          content: [{ type: "output_text", text: "No citations here." }],
        },
      ],
    },
    website,
    1,
  );
  assert.equal(a.status, "no_citations");
  assert.equal(a.sources[0].cited, false);
});
test("Empty provider text fails instead of reporting a successful answer", () => {
  assert.throws(() => parseAnswer("ChatGPT", { choices: [] }, website));
});
test("Own-website comparison handles www and subdomains, not lookalike domains", () => {
  assert.equal(ownWebsite("https://blog.example.com/x", website), true);
  assert.equal(ownWebsite("https://example.com.evil.org", website), false);
  assert.equal(ownWebsite("https://notexample.com", website), false);
});
test("Private URLs, credential URLs, unsupported protocols and ports are rejected", () => {
  for (const u of [
    "http://127.0.0.1",
    "http://2130706433",
    "http://[::1]",
    "http://localhost",
    "http://a.local",
    "https://user:pass@example.com",
    "ftp://example.com",
    "https://example.com:8080",
  ])
    assert.throws(() => publicUrl(u), u);
  assert.equal(
    publicUrl("https://example.com/loan#faq"),
    "https://example.com/loan",
  );
});
test("Page comparison flags missing fees with the actual number and keeps covered rates", () => {
  const brand = makePage(
    "Personal loans are available. Interest rates start at 14% per annum.",
  );
  const cited = makePage(
    "Interest rates start at 12% per annum. Processing fees are up to 2% of the loan amount.",
    "https://competitor.com/loan",
  );
  const gaps = compareTopics(brand, [cited]);
  const missing = gaps.find((g) => g.topic === "Processing fees")!;
  assert.equal(missing.kind, "missing");
  assert.match(missing.evidence, /2%/);
  assert.equal(missing.sourceUrl, cited.url);
  assert.equal(
    gaps.find((g) => g.topic === "Interest rate / APR")?.kind,
    "covered",
  );
});
test("Unreadable NBFC pages never become missing-content findings; unreadable sources are skipped", () => {
  const brand = makePage("");
  brand.status = "unavailable";
  assert.deepEqual(
    compareTopics(brand, [makePage("Processing fees are 2%.")]),
    [],
  );
  const unreadable = makePage("Processing fees are 2%.");
  unreadable.status = "unavailable";
  assert.deepEqual(compareTopics(makePage("Personal loan"), [unreadable]), []);
});
test("Shortened NBFC captures mark absence as uncertain", () => {
  const brand = makePage("Personal loans.");
  brand.truncated = true;
  assert.equal(
    compareTopics(brand, [
      makePage("Processing fees are 2%.", "https://competitor.com"),
    ])[0].kind,
    "uncertain",
  );
});
test("Semantic findings must carry real quoted evidence and a known source URL", () => {
  const brand = makePage("Interest rates start at 14%.");
  const cited = makePage(
    "Processing fees are up to 2% of the loan amount.",
    "https://competitor.com/loan",
  );
  const valid: Gap = {
    topic: "Fee details",
    kind: "missing",
    sourceUrl: cited.url,
    evidence: cited.text,
    brandEvidence: "",
    explanation: "Review fee disclosure.",
    method: "semantic",
  };
  assert.equal(validateSemantic([valid], brand, [cited]).length, 1);
  assert.equal(
    validateSemantic(
      [
        { ...valid, evidence: "Zero fees and instant guaranteed approval." },
        { ...valid, sourceUrl: "https://invented.com" },
        { ...valid, kind: "covered", brandEvidence: "Fees are free." },
        { ...valid, kind: "uncertain", brandEvidence: "Fees are free." },
      ],
      brand,
      [cited],
    ).length,
    0,
  );
});
import { extractPageText } from "../convex/html";
test("Page reader includes product details outside main and excludes scripts and hidden content", () => {
  const html =
    "<html><head><title>Product page</title></head><body><nav>Navigation</nav><main><h1>Personal loan</h1></main><section><p>Processing fees are 2%.</p></section><footer>APR disclosures apply.</footer><script>fake zero fees</script><div hidden>Guaranteed approval</div></body></html>";
  const page = extractPageText(html);
  assert.equal(page.title, "Product page");
  assert.match(page.text, /Processing fees are 2%/);
  assert.match(page.text, /APR disclosures/);
  assert.doesNotMatch(page.text, /fake|Navigation|Guaranteed/);
});
test("Evidence keeps decimal fees and interest rates intact", () => {
  const brand = makePage("Personal loans are available.");
  const cited = makePage(
    "Interest rates start at 10.99% p.a. Processing fees are up to 2.5% of the loan amount.",
    "https://competitor.com/rates",
  );
  const gaps = compareTopics(brand, [cited]);
  assert.match(
    gaps.find((g) => g.topic === "Interest rate / APR")!.evidence,
    /10\.99%/,
  );
  assert.match(
    gaps.find((g) => g.topic === "Processing fees")!.evidence,
    /2\.5%/,
  );
});
