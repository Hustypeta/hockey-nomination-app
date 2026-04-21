/**
 * App ID z Meta for Developers (developers.facebook.com → aplikace → Nastavení → Základní → ID aplikace).
 *
 * **Na Railway/hostingu bez nového buildu používej `FACEBOOK_APP_ID` (bez NEXT_PUBLIC).**
 * `NEXT_PUBLIC_*` Next.js při **buildu** přepíše přímo do bundle — hodnota přidaná jen do runtime env po deployi tam **nebude**.
 *
 * Pořadí: serverové env za běhu → fallback v kódu → `NEXT_PUBLIC_FB_APP_ID` (jen po rebuildu platné).
 */
export const FACEBOOK_APP_ID_FALLBACK = "";

function normalizeFacebookAppId(raw: string | undefined): string | undefined {
  if (raw == null) return undefined;
  let t = String(raw)
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\s/g, "");
  if (!t) return undefined;
  if (!/^\d{5,20}$/.test(t)) return undefined;
  return t;
}

export function resolveFacebookAppId(): string | undefined {
  return (
    normalizeFacebookAppId(process.env.FACEBOOK_APP_ID) ??
    normalizeFacebookAppId(process.env.META_APP_ID) ??
    normalizeFacebookAppId(FACEBOOK_APP_ID_FALLBACK) ??
    normalizeFacebookAppId(process.env.NEXT_PUBLIC_FB_APP_ID)
  );
}
