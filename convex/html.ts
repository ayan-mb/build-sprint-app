import { parseHTML } from "linkedom";
export function extractPageText(raw: string): { title: string; text: string } {
  const { document } = parseHTML(raw);
  const title = document.querySelector("title")?.textContent?.trim() ?? "";
  for (const el of document.querySelectorAll(
    'script,style,noscript,svg,nav,[hidden],[aria-hidden="true"]',
  ))
    el.remove();
  // Product details often live outside <main>. Keep visible body content, including disclosures.
  const root = document.body;
  for (const el of root.querySelectorAll("p,li,h1,h2,h3,h4,tr,br,div,section"))
    el.appendChild(document.createTextNode("\n"));
  return { title, text: (root.textContent ?? "").replace(/\s+/g, " ").trim() };
}
