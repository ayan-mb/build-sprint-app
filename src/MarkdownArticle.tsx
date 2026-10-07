import { Children, createElement, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { renderToStaticMarkup } from "react-dom/server";
import { unified } from "unified";
import remarkParse from "remark-parse";

function legacyMarks(children: ReactNode) {
  return Children.map(children, child => typeof child === "string"
    ? child.split(/(\[add:[^\]]+\]|\[VERIFY\][^\n]*)/g).map((part, index) => /^\[(add:|VERIFY\])/.test(part) ? <mark key={index}>{part}</mark> : part)
    : child);
}
export function MarkdownArticle({ text }: { text: string }) {
  return <article className="draft-article" aria-label="Draft article">
    <Markdown remarkPlugins={[remarkGfm]} skipHtml
      allowedElements={["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "strong", "em", "del", "a", "table", "thead", "tbody", "tr", "th", "td", "blockquote", "pre", "code", "hr", "br"]}
      components={{ p: ({ children }) => <p>{legacyMarks(children)}</p> }}>
      {text}
    </Markdown>
  </article>;
}
export function markdownHtml(text: string) {
  return renderToStaticMarkup(createElement(MarkdownArticle, { text }));
}
type TextNode = { type: string; value?: string; children?: TextNode[]; ordered?: boolean | null; start?: number | null; alt?: string | null };
export function markdownPlainText(text: string) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(text);
  function read(node: TextNode): string {
    const children = node.children || [];
    if (node.type === "html") return "";
    if (node.type === "image") return node.alt || "";
    if (node.type === "break") return "\n";
    if (node.type === "root" || node.type === "listItem" || node.type === "blockquote") return children.map(read).filter(Boolean).join("\n\n");
    if (node.type === "list") return children.map((item, i) => `${node.ordered ? `${(node.start || 1) + i}.` : "•"} ${read(item)}`).join("\n");
    if (node.type === "table") return children.map(read).join("\n");
    if (node.type === "tableRow") return children.map(read).join("\t");
    return node.value ?? children.map(read).join("");
  }
  return read(tree).trim();
}
