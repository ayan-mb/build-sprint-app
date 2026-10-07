import { test } from "node:test";
import assert from "node:assert/strict";
import { markdownHtml, markdownPlainText } from "../src/MarkdownArticle";
import { copyDraft, draftExport } from "../src/draftExport";
const markdown = "# Loan guide\n\n## Costs\n\n### Fees\n\nRead **approved terms**.\n\n- Income proof\n- Identity proof\n\n| Fee | Amount |\n| --- | --- |\n| Processing | 2% |\n\nhttps://brand.com/fees";
test("articles render real headings, paragraphs, lists, bold and tables without Markdown delimiters", () => {
  const html = markdownHtml(markdown);
  for (const tag of ["h1","h2","h3","p","ul","li","strong","table","th","td"]) assert.match(html,new RegExp(`<${tag}(?:>| )`));
  assert.doesNotMatch(html, /# Loan|## Costs|\*\*approved|\| Fee/);
  assert.match(html,/href="https:\/\/brand.com\/fees"/);
  assert.equal(draftExport(markdown,"markdown"),markdown);
  const plain = markdownPlainText(markdown);
  assert.doesNotMatch(plain,/#|\*\*|\|/);
  assert.match(plain,/• Income proof/);
  assert.match(plain,/Fee\tAmount/);
});
test("Markdown cannot inject raw scripts or unsafe links", () => {
  const html = markdownHtml('<script>alert(1)</script>\n\n[click](javascript:alert(1))\n\n<img src=x onerror="alert(1)">');
  assert.doesNotMatch(html,/<script|<img|javascript:|onerror=/);
});
test("Copy writes HTML and plain text, and falls back when HTML clipboard writes are rejected", async () => {
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis,"navigator");
  const itemDescriptor = Object.getOwnPropertyDescriptor(globalThis,"ClipboardItem");
  let payload: Record<string,Blob> = {};
  let fallback = "";
  class TestClipboardItem { constructor(items:Record<string,Blob>) {payload=items;} }
  const clipboard = { write: async (_items: unknown[]) => {}, writeText: async (text:string) => {fallback=text;} };
  Object.defineProperty(globalThis,"navigator",{configurable:true,value:{clipboard}});
  Object.defineProperty(globalThis,"ClipboardItem",{configurable:true,value:TestClipboardItem});
  try {
    assert.equal(await copyDraft(markdown),"rich");
    assert.match(await payload["text/html"].text(),/<h1>Loan guide<\/h1>/);
    assert.match(await payload["text/html"].text(),/<strong>approved terms<\/strong>/);
    assert.equal(await payload["text/plain"].text(),markdownPlainText(markdown));
    assert.equal(fallback,"");
    clipboard.write = async () => {throw new Error("HTML unavailable");};
    assert.equal(await copyDraft(markdown),"text");
    assert.equal(fallback,markdownPlainText(markdown));
    Object.defineProperty(globalThis,"ClipboardItem",{configurable:true,value:undefined});
    assert.equal(await copyDraft(markdown),"text");
  } finally {
    if(navigatorDescriptor) Object.defineProperty(globalThis,"navigator",navigatorDescriptor); else Reflect.deleteProperty(globalThis,"navigator");
    if(itemDescriptor) Object.defineProperty(globalThis,"ClipboardItem",itemDescriptor); else Reflect.deleteProperty(globalThis,"ClipboardItem");
  }
});
