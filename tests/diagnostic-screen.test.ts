import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProviderAnswer, Finding, PageRead } from "../src/App";
import type { Answer, Gap } from "../convex/validators";
test("The actual provider screen renders a clear missing-key message without invented answers", () => {
  const answer: Answer = {
    provider: "ChatGPT",
    model: "fixture",
    status: "key_missing",
    text: "",
    sources: [],
    message:
      "Key missing: OPENAI_API_KEY. Add it in Convex Settings → Environment Variables.",
    fetchedAt: 1,
  };
  const html = renderToStaticMarkup(createElement(ProviderAnswer, { answer }));
  assert.match(html, /Key missing: OPENAI_API_KEY/);
  assert.match(html, /No verified source links returned/);
  assert.doesNotMatch(html, /Answer received/);
});
test("The actual source screen shows clickable citations, own-site labels, and search-only labels", () => {
  const answer: Answer = {
    provider: "Perplexity",
    model: "fixture",
    status: "ready",
    text: "Loan fees are stated [1].",
    message: "",
    fetchedAt: 1,
    sources: [
      {
        url: "https://example.com/fees",
        title: "Fee disclosure",
        cited: true,
        reference: "[1]",
        ownWebsite: true,
      },
      {
        url: "https://competitor.com/loan",
        title: "Search only",
        cited: false,
        reference: "[2]",
        ownWebsite: false,
      },
    ],
  };
  const html = renderToStaticMarkup(createElement(ProviderAnswer, { answer }));
  assert.match(html, /href="https:\/\/example.com\/fees"/);
  assert.match(html, /Cited \[1\]/);
  assert.match(html, /Your website/);
  assert.match(html, /Search result only/);
});
test("The actual gap screen renders the number and evidence link and escapes source HTML", () => {
  const gap: Gap = {
    topic: "Processing fees",
    kind: "missing",
    evidence: "Processing fees are 2%. <script>bad()</script>",
    sourceUrl: "https://competitor.com/fees",
    brandEvidence: "",
    explanation: "Not found in your captured page.",
    method: "topic_check",
  };
  const html = renderToStaticMarkup(createElement(Finding, { gap }));
  assert.match(html, /Processing fees are 2%/);
  assert.match(html, /Not found on your page/);
  assert.match(html, /href="https:\/\/competitor.com\/fees"/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});
test("Unreadable pages show the cause rather than claiming that the page was read", () => {
  const html = renderToStaticMarkup(
    createElement(PageRead, {
      page: {
        url: "https://example.com",
        finalUrl: "https://example.com",
        title: "",
        text: "",
        status: "unavailable",
        message: "Website returned HTTP 403.",
        truncated: false,
        fetchedAt: 1,
      },
    }),
  );
  assert.match(html, /Page unavailable/);
  assert.match(html, /HTTP 403/);
  assert.doesNotMatch(html, /characters captured/);
});
