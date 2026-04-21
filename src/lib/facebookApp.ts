/**
 * App ID z Meta for Developers (developers.facebook.com → aplikace → Nastavení → Základní → ID aplikace).
 *
 * Pořadí: proměnné prostředí na serveru (jakýkoli hosting), jinak {@link FACEBOOK_APP_ID_FALLBACK} níže.
 * Bez platného ID Sharing Debugger hlásí chybějící fb:app_id.
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

/** Volat v generateMetadata (ideálně po `connection()`), ať se načte až za běhu — ne při prázdném buildu. */
export function resolveFacebookAppId(): string | undefined {
  return (
    normalizeFacebookAppId(process.env.NEXT_PUBLIC_FB_APP_ID) ??
    normalizeFacebookAppId(process.env.FACEBOOK_APP_ID) ??
    normalizeFacebookAppId(process.env.META_APP_ID) ??
    normalizeFacebookAppId(FACEBOOK_APP_ID_FALLBACK)
  );
}
