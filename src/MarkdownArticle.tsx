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
export const verifyPattern = /\[VERIFY(?:\s*:[^\]]*)?\]/gi;
export function hasVerification(text: string) { return /\[VERIFY(?:\s*:[^\]]*)?\]/i.test(text); }
export function VerificationText({ text, onChange }: { text: string; onChange: (text: string) => void }) {
  const parts = text.split(/(\[VERIFY(?:\s*:[^\]]*)?\]|\[add:[^\]]+\])/gi);
  let offset = 0;
  return <>{parts.map((part, index) => {
    const start = offset; offset += part.length;
    return hasVerification(part) ? <mark key={`${index}-${part}`} contentEditable suppressContentEditableWarning role="textbox" aria-label="Verify and replace this claim" tabIndex={0} onBlur={e => onChange(text.slice(0, start) + (e.currentTarget.textContent || "") + text.slice(start + part.length))}>{part}</mark> : /^\[add:/i.test(part) ? <mark key={index}>{part}</mark> : part;
  })}</>;
}
export function MarkdownArticle({ text, onChange }: { text: string; onChange?: (text: string) => void }) {
  type PositionedNode = { position?: { start: { offset?: number }; end?: { offset?: number } }; children?: PositionedNode[] };
  const editable = (children: ReactNode, node?: PositionedNode) => Children.map(children, (child, childIndex) => {
    if (typeof child !== "string") return child;
    const sourceNode = node?.children?.[childIndex] || node;
    const start = sourceNode?.position?.start.offset ?? 0;
    const end = sourceNode?.position?.end?.offset ?? text.length;
    const rawTags = [...text.slice(start, end).matchAll(verifyPattern)];
    let occurrence = 0;
    return child.split(/(\[VERIFY(?:\s*:[^\]]*)?\]|\[add:[^\]]+\])/gi).map((part, index) => {
      if (!hasVerification(part)) return /^\[add:/i.test(part) ? <mark key={index}>{part}</mark> : part;
      const raw = rawTags[occurrence++];
      if (!raw) return <mark key={index}>{part}</mark>;
      const position = start + raw.index!;
      return <mark key={`${index}-${part}`} contentEditable suppressContentEditableWarning role="textbox" aria-label="Verify and replace this claim" tabIndex={0} onBlur={e => onChange?.(text.slice(0, position) + (e.currentTarget.textContent || "") + text.slice(position + raw[0].length))}>{part}</mark>;
    });
  });
  const tags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "strong", "em", "del", "a", "th", "td", "blockquote", "code"] as const;
  const components = Object.fromEntries(tags.map(tag => [tag, ({children, node, ...props}: {children?: ReactNode; node?: PositionedNode}) => createElement(tag, props, onChange ? editable(children, node) : legacyMarks(children))]));
  return <article className="draft-article" aria-label="Draft article">
    <Markdown remarkPlugins={[remarkGfm]} skipHtml
      allowedElements={["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "strong", "em", "del", "a", "table", "thead", "tbody", "tr", "th", "td", "blockquote", "pre", "code", "hr", "br"]}
      components={components}>
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
