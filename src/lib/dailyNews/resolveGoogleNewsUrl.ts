/**
 * Google News RSS odkazy jsou redirecty (news.google.com/rss/articles/<id>).
 * Starší formát má v <id> zakódovanou cílovou URL (base64 protobuf) — zkusíme ji
 * vytáhnout, ať máme přímý odkaz na článek (pro proklik i pro OG náhled).
 * Novější šifrované id (např. začínající "AU_yqL") rozluštit nejde → vrátíme původní.
 */
export function resolveGoogleNewsUrl(link: string): string {
  try {
    const u = new URL(link);
    if (!u.hostname.endsWith("news.google.com")) return link;

    const m =
      u.pathname.match(/\/(?:rss\/)?articles\/([^?/]+)/) ??
      u.pathname.match(/\/read\/([^?/]+)/);
    if (!m?.[1]) return link;

    let b64 = m[1].replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4 !== 0) b64 += "=";

    const decoded = Buffer.from(b64, "base64").toString("latin1");
    const urlMatch = decoded.match(/https?:\/\/[^\x00-\x1f"'<>\\ ]+/);
    if (!urlMatch) return link;

    const candidate = new URL(urlMatch[0]);
    if (candidate.hostname.endsWith("google.com")) return link;
    return candidate.href;
  } catch {
    return link;
  }
}
