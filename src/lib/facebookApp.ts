/**
 * App ID z Meta for Developers (developers.facebook.com → Tvoje aplikace → Nastavení → Základní → ID aplikace).
 * Bez něj Sharing Debugger hlásí chybějící fb:app_id — nastav na Vercelu např.
 * NEXT_PUBLIC_FB_APP_ID nebo FACEBOOK_APP_ID (stačí jedna).
 */
export function resolveFacebookAppId(): string | undefined {
  const raw =
    process.env.NEXT_PUBLIC_FB_APP_ID ??
    process.env.FACEBOOK_APP_ID ??
    process.env.META_APP_ID;
  const t = raw?.trim();
  return t && /^\d+$/.test(t) ? t : undefined;
}
