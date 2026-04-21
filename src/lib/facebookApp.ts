/**
 * App ID z Meta for Developers (developers.facebook.com → aplikace → Nastavení → Základní → ID aplikace).
 *
 * Pořadí: proměnné prostředí na serveru (jakýkoli hosting), jinak {@link FACEBOOK_APP_ID_FALLBACK} níže.
 * Bez platného ID Sharing Debugger hlásí chybějící fb:app_id.
 */
export const FACEBOOK_APP_ID_FALLBACK = "";

export function resolveFacebookAppId(): string | undefined {
  const raw =
    process.env.NEXT_PUBLIC_FB_APP_ID ??
    process.env.FACEBOOK_APP_ID ??
    process.env.META_APP_ID ??
    FACEBOOK_APP_ID_FALLBACK;
  const t = raw?.trim();
  return t && /^\d+$/.test(t) ? t : undefined;
}
