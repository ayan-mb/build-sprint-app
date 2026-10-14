import { parseHTML } from "linkedom";
import { publicUrl } from "./evidence";

export function discoverBrandIcons(html: string, pageUrl: string): string[] {
  const { document } = parseHTML(html);
  let base = pageUrl;
  try {
    const declaredBase = document.querySelector("base[href]")?.getAttribute("href");
    if (declaredBase) base = publicUrl(new URL(declaredBase, pageUrl).href);
  } catch { /* Ignore invalid base URLs. */ }
  const icons: string[] = [];
  for (const link of document.querySelectorAll("link[href]")) {
    if (!/(?:^|\s)(?:icon|apple-touch-icon|apple-touch-icon-precomposed)(?:\s|$)/i.test(link.getAttribute("rel") || "")) continue;
    try { icons.push(publicUrl(new URL(link.getAttribute("href")!, base).href)); }
    catch { /* Only public HTTP images are eligible. */ }
  }
  for (const path of ["favicon.ico", "favicon.png", "apple-touch-icon.png"]) {
    icons.push(new URL(`/${path}`, pageUrl).href);
  }
  return [...new Set(icons)].slice(0, 12);
}
