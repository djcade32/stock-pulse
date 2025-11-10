import mixpanel from "mixpanel-browser";

declare global {
  interface Window {
    __SW_ANALYTICS__?: { initialized: boolean };
    __SW_EVENT_CACHE__?: Record<string, number>;
  }
}

// const isProd = true;
const isProd = process.env.NODE_ENV === "production";
const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN as string;

// ---- Init guard: only once per page lifecycle
export function initAnalytics() {
  if (!isProd) console.warn("Analytics not initialized in non-production environment"); // never in dev
  if (!TOKEN) console.error("Mixpanel token not set; analytics will not function");
  if (window.__SW_ANALYTICS__?.initialized) return;
  mixpanel.init(TOKEN, {
    debug: false,
    track_pageview: false,
    persistence: "localStorage",
  });

  window.__SW_ANALYTICS__ = { initialized: true };
  if (!window.__SW_EVENT_CACHE__) window.__SW_EVENT_CACHE__ = {};
}

// ---- De-dupe helper: prevent same event from firing repeatedly
function shouldFire(key: string, ttlMs = 4000) {
  const cache = window.__SW_EVENT_CACHE__!;
  const now = Date.now();
  const last = cache[key] ?? 0;
  if (now - last < ttlMs) return false; // too soon -> skip
  cache[key] = now;
  return true;
}

// Stable, stringified key of props for dedupe
function buildKey(event: string, props?: Record<string, any>) {
  const base = event.toLowerCase();
  const p = props ? JSON.stringify(props, Object.keys(props).sort()) : "";
  return `${base}:${p}`;
}

export function track(
  event: string,
  props?: Record<string, any>,
  opts?: { ttlMs?: number; key?: string }
) {
  if (!isProd) return;
  initAnalytics();
  const key = opts?.key ?? buildKey(event, props);
  if (!shouldFire(key, opts?.ttlMs)) return;
  mixpanel.track(event, props);
}

export function identify(userId: string, props?: Record<string, any>) {
  if (!isProd) return;
  initAnalytics();
  mixpanel.identify(userId);
  if (props) mixpanel.people.set(props);
}

export function setSuperProps(props: Record<string, any>) {
  if (!isProd) return;
  initAnalytics();
  mixpanel.register(props);
}

export function setUserProps(props: Record<string, any>) {
  if (!isProd) return;
  initAnalytics();
  mixpanel.people.set(props);
}

export function resetAnalytics() {
  if (!isProd) return;
  mixpanel.reset();
  if (window.__SW_EVENT_CACHE__) window.__SW_EVENT_CACHE__ = {};
}
