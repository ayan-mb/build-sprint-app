import type { Config } from "mixpanel-browser";
const PROJECT_TOKEN = "0ea854be96c0810bad1b43b47ab460cc";
const events = ["Try page viewed", "Batch started", "Batch finished", "Draft written", "Draft copied", "Draft downloaded"] as const;
export type TryEvent = typeof events[number];
const heatmapEvents = new Set(["$mp_web_page_view", "$mp_click", "$mp_scroll", "$mp_page_leave", "$mp_dead_click", "$mp_rage_click"]);
export const blockedRecordingSelectors = [".batch-results", ".draft-box", ".run-link", "input", "textarea", "img", "video", "audio", "canvas", "iframe"];
export function analyticsDomain(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    if (url.username || url.password || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)) return undefined;
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch { return undefined; }
}
function count(value: unknown) { return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 20 ? value : undefined; }
export function eventProperties(event: TryEvent, properties: Record<string, unknown> = {}) {
  const safe: Record<string, string | number> = {};
  if (event === "Batch started" || event === "Batch finished") {
    const questions = count(properties.question_count);
    if (questions !== undefined) safe.question_count = questions;
  }
  if (event === "Batch started") {
    const domain = analyticsDomain(properties.nbfc_domain);
    if (domain) safe.nbfc_domain = domain;
    if (properties.mode === "single" || properties.mode === "multiple") safe.mode = properties.mode;
  }
  if (event === "Batch finished") {
    const results = count(properties.result_count);
    if (results !== undefined) safe.result_count = results;
  }
  return safe;
}
// Last check before transmission: SDK defaults and DOM attributes cannot add content or identity.
export function safeAnalyticsPayload(payload: { event: string; properties: Record<string, unknown> }, path: string, origin: string) {
  const heatmap = heatmapEvents.has(payload.event);
  if (path !== "/try" || !heatmap && !events.includes(payload.event as TryEvent)) return null;
  const safe: Record<string, unknown> = heatmap ? {} : eventProperties(payload.event as TryEvent,payload.properties);
  safe.token = PROJECT_TOKEN;
  for (const key of ["distinct_id", "$device_id", "$insert_id", "$mp_replay_id"]) {
    const value = payload.properties[key];
    if (typeof value === "string" && /^[a-z0-9:$._-]{8,150}$/i.test(value)) safe[key] = value;
  }
  if (typeof payload.properties.time === "number") safe.time = payload.properties.time;
  if (heatmap) {
    safe.$current_url = `${origin}/try`; safe.$pathname = "/try"; safe.$host = new URL(origin).host;
    for (const [key,value] of Object.entries(payload.properties)) {
      if (/^\$(?:clientX|clientY|offsetX|offsetY|pageX|pageY|screenX|screenY|x|y|viewportHeight|viewportWidth|pageHeight|pageWidth|max_scroll_percentage|fold_line_percentage|scroll_height|scroll_percentage|scroll_checkpoint|scroll_view_height)$/.test(key) && typeof value === "number" && Number.isFinite(value)) safe[key] = value;
    }
    safe.$captured_for_heatmap = payload.properties.$captured_for_heatmap === true;
    safe.$mp_autocapture = true;
    if (Array.isArray(payload.properties.$elements)) safe.$elements = payload.properties.$elements.map(element => {
      const clean: Record<string,unknown> = {};
      if (element && typeof element === "object") {
        if (typeof element.$tag_name === "string" && /^[a-z0-9-]{1,30}$/i.test(element.$tag_name)) clean.$tag_name = element.$tag_name;
        for (const key of ["$nth_child","$nth_of_type"]) if (Number.isInteger(element[key]) && element[key] > 0) clean[key] = element[key];
      }
      return clean;
    });
  }
  return {event:payload.event,properties:safe};
}
type Sdk = { init: (token: string, config: Partial<Config>) => unknown; track: (event: string, properties: Record<string,unknown>) => unknown };
type Storage = Pick<globalThis.Storage,"getItem"|"setItem">;
export function createTryAnalytics(options: { path: () => string; origin: () => string; load: () => Promise<Sdk>; storage: () => Storage | undefined; cleanUrl?: () => void }) {
  let sdk: Sdk | undefined;
  let initializing: Promise<void> | undefined;
  const seen = new Set<string>();
  function active() { return options.path() === "/try"; }
  function known(key: string) { try { return seen.has(key) || !!options.storage()?.getItem(key); } catch { return seen.has(key); } }
  function remember(key: string) { seen.add(key); try { options.storage()?.setItem(key,"1"); } catch {} }
  function init() {
    if (!active()) return Promise.resolve();
    if (initializing) return initializing;
    initializing = (async () => {
      options.cleanUrl?.();
      const loaded = await options.load();
      if (!active()) return;
      loaded.init(PROJECT_TOKEN,{
        debug: true, track_pageview: true, persistence: "localStorage", persistence_name: "try_analytics_v1",
        ip: false, save_referrer: false, store_google: false, stop_utm_persistence: true, skip_first_touch_marketing: true,
        remote_settings_mode: "disabled", flags: false,
        record_sessions_percent: 100, record_heatmap_data: true, record_min_ms: 0,
        record_mask_all_text: true, record_mask_all_inputs: true, record_unmask_text_selector: [], record_unmask_input_selector: [],
        record_block_selector: blockedRecordingSelectors.join(","), record_console: false, record_network: false,
        record_canvas: false, record_inline_images: false, record_collect_fonts: false, record_allowed_iframe_origins: [],
        autocapture: { pageview: false, click: false, input: false, submit: false, scroll: false, rage_click: false, dead_click: false, capture_text_content: false, capture_extra_attrs: [], block_attrs: ["href","value","title","aria-label","name"], block_selectors: blockedRecordingSelectors },
        hooks: { before_identify: () => null, before_send_events: payload => safeAnalyticsPayload(payload,options.path(),options.origin()) },
      });
      sdk = loaded;
      loaded.track("Try page viewed",{});
    })().catch(() => { /* Analytics must never interrupt the product. */ });
    return initializing;
  }
  function track(event: TryEvent, properties: Record<string,unknown> = {}) {
    if (!active()) return;
    const safe = eventProperties(event,properties);
    void init().then(() => { if (active() && sdk) { try { sdk.track(event,safe); } catch {} } });
  }
  function once(event: TryEvent, id: string, properties: Record<string,unknown> = {}) {
    if (!active()) return;
    const key = `try-analytics:${event}:${id}`;
    if (known(key)) return;
    remember(key); track(event,properties);
  }
  return { init, track, once, batchStarted: (id: string, questionCount: number, domain: string, mode: "single" | "multiple" = "multiple") => once("Batch started",id,{question_count:questionCount,nbfc_domain:domain,mode}), batchFinished: (id: string, questionCount: number, resultCount: number) => {
    if (known(`try-analytics:Batch started:${id}`)) once("Batch finished",id,{question_count:questionCount,result_count:resultCount});
  } };
}
export const tryAnalytics = createTryAnalytics({
  path: () => typeof window === "undefined" ? "" : window.location.pathname,
  origin: () => window.location.origin,
  storage: () => window.sessionStorage,
  load: async () => (await import("mixpanel-browser")).default,
  cleanUrl: () => { if (window.location.search || window.location.hash) window.history.replaceState(window.history.state,"","/try"); },
});
