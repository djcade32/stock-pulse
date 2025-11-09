export type AnalyticsConsent = "accepted" | "rejected" | "unknown";
const CONSENT_COOKIE = "mix_consent";
const CONSENT_EVENT = "mix-consent-change";

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; Expires=${expires}; Path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1] ?? null
  );
}

export function getAnalyticsConsent(): AnalyticsConsent {
  const v = getCookie(CONSENT_COOKIE);
  if (v === "accepted" || v === "rejected") return v;
  return "unknown";
}

export function setAnalyticsConsent(value: AnalyticsConsent) {
  setCookie(CONSENT_COOKIE, value, 365);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export function onAnalyticsConsentChange(cb: (v: AnalyticsConsent) => void) {
  const handler = (e: Event) => cb((e as CustomEvent).detail as AnalyticsConsent);
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}
