"use node";
import { lookup } from "node:dns/promises";
import { fetch as pageFetch, Agent as HttpAgent, type Response as HttpResponse } from "undici";
import { parseHTML } from "linkedom";
import { publicUrl, ownWebsite } from "./evidence";
function privateAddress(ip: string): boolean {
  if (ip.includes(":")) return true; // IPv4 only, including on redirects; avoids IPv6 private/mapped addresses.
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224 ||
    (a === 198 && (b === 18 || b === 19))
  );
}
async function safeFetch(
  url: string,
): Promise<{
  response: HttpResponse;
  finalUrl: string;
  dispatcher: HttpAgent;
}> {
  let current = publicUrl(url);
  for (let i = 0; i < 5; i++) {
    const hostname = new URL(current).hostname;
    const addresses = await lookup(hostname, { all: true, family: 4 });
    if (!addresses.length || addresses.some((a) => privateAddress(a.address)))
      throw new Error("This URL does not resolve to a public website.");
    const address = addresses[0].address;
    const dispatcher = new HttpAgent({
      connect: {
        lookup: (_host, options, callback) => {
          if (options.all) callback(null, [{ address, family: 4 }]);
          else callback(null, address, 4);
        },
      },
    });
    let response: HttpResponse;
    try {
      response = await pageFetch(current, {
        dispatcher,
        redirect: "manual",
        signal: AbortSignal.timeout(18000),
        headers: {
          "User-Agent": "NBFC-Citation-Diagnostic/1.0",
          Accept: "text/html,text/plain",
        },
      });
    } catch (e) {
      await dispatcher.destroy();
      throw e;
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      await dispatcher.close();
      if (!location) throw new Error("Redirect has no destination.");
      current = publicUrl(new URL(location, current).href);
      continue;
    }
    return { response, finalUrl: current, dispatcher };
  }
  throw new Error("Too many page redirects.");
}
async function limitedText(response: HttpResponse): Promise<string> {
  if (Number(response.headers.get("content-length") ?? 0) > 1000000)
    throw new Error("Page is too large to read (limit: 1 MB).");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Page has no readable body.");
  let length = 0;
  const chunks: Uint8Array[] = [];
  let timedOut = false;
  const deadline = setTimeout(() => {
    timedOut = true;
    void reader.cancel();
  }, 18000);
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 1000000) {
        await reader.cancel();
        throw new Error("Page is too large to read (limit: 1 MB).");
      }
      chunks.push(value);
    }
  } finally {
    clearTimeout(deadline);
  }
  if (timedOut)
    throw new Error("Page body timed out before it finished downloading.");
  const out = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(out);
}

export function selectBrandLinks(website: string, question: string, links: string[]) {
  const personal = /personal|cibil|credit score/i.test(question);
  const keywords = personal ? ["personal-loan", "personal_loan", "personal/loan"] : question.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const candidates = [...new Set(links)].filter(url => ownWebsite(url, website) && keywords.some(k => new URL(url).pathname.toLowerCase().includes(k)));
  const product = new URL(website).pathname !== "/" ? website : candidates.find(u => !/eligib|interest|rate|fee|charge/i.test(new URL(u).pathname)) || website;
  const rates = candidates.find(u => /interest|rate|fee|charge/i.test(new URL(u).pathname));
  const eligibility = candidates.find(u => /eligib/i.test(new URL(u).pathname));
  return [...new Set([product, rates, eligibility].filter((u): u is string => !!u))].slice(0, 3);
}
export async function discoverBrandUrls(website: string, question: string) {
  try {
    const fetched = await safeFetch(website);
    try {
      if (!fetched.response.ok || !ownWebsite(fetched.finalUrl, website)) return [website];
      const { document } = parseHTML(await limitedText(fetched.response));
      const links = [...document.querySelectorAll("a[href]")].flatMap(a => {
        try { const url = publicUrl(new URL(a.getAttribute("href") || "", fetched.finalUrl).href); return ownWebsite(url, website) ? [url] : []; } catch { return []; }
      });
      return selectBrandLinks(website, question, links);
    } finally { await fetched.dispatcher.close(); }
  } catch { return [website]; }
}
