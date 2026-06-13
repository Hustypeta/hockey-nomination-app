import { SITE_CANONICAL_HOST } from "@/lib/siteBranding";

const SITE_URL = `https://${SITE_CANONICAL_HOST}`;
const FANTASY_LEADERBOARD_URL = `${SITE_URL}/zebricek?soutez=fantasy`;
const LOGO_URL = `${SITE_URL}/images/logo.png`;

export const FANTASY_RESULTS_EMAIL_SUBJECT = "Výsledek soutěže Daily Fantasy — Lineup";

export type FantasyResultsEmailPersonalization = {
  points: number;
  rank: number;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rankPhrase(rank: number): string {
  return `${rank}. místě`;
}

export function buildFantasyResultsThankYouText({
  points,
  rank,
}: FantasyResultsEmailPersonalization): string {
  return [
    "Vážený uživateli,",
    "",
    `v soutěži Daily Fantasy MS 2026 na platformě Lineup jste získal ${points} bodů a umístil jste se na ${rankPhrase(rank)}. Velmi si vážíme, že využíváte naši platformu a děkujeme za Vaši účast v soutěži.`,
    "",
    `Kompletní žebříček včetně rozpisu bodů po dnech najdete na našem webu (${FANTASY_LEADERBOARD_URL}).`,
    "",
    "Budeme velmi vděční, pokud platformu doporučíte svým známým a přátelům, nebo se zaregistrujete prostřednictvím banneru na našem webu do Tipsportu.",
    "",
    "Moc Vám děkujeme za veškerou podporu a těšíme se na Vás u dalších soutěží na Lineup.",
    "",
    "Tým Lineup",
    "",
    `Žebříček Fantasy: ${FANTASY_LEADERBOARD_URL}`,
    `Web: ${SITE_URL}`,
  ].join("\n");
}

export function buildFantasyResultsThankYouHtml({
  points,
  rank,
}: FantasyResultsEmailPersonalization): string {
  const preheader = `Daily Fantasy MS 2026: ${points} bodů, ${rank}. místo — žebříček a podpora projektu.`;
  const pointsStr = escapeHtml(String(points));
  const rankStr = escapeHtml(rankPhrase(rank));

  return `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(FANTASY_RESULTS_EMAIL_SUBJECT)}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#0c0e12;">
    <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
      ${escapeHtml(preheader)}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0c0e12; width:100%;">
      <tr>
        <td align="center" style="padding:28px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="680" style="width:100%; max-width:680px;">
            <tr>
              <td style="padding:0;">
                <div
                  style="
                    background:
                      radial-gradient(ellipse 90% 60% at 50% -20%, rgba(0,63,135,0.58) 0%, rgba(0,0,0,0) 58%),
                      radial-gradient(ellipse 70% 55% at 10% 110%, rgba(200,16,46,0.20) 0%, rgba(0,0,0,0) 60%);
                    padding: 12px;
                    border-radius: 22px;
                  "
                >
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                    style="
                      width:100%;
                      background-color: rgba(17,23,32,0.94);
                      border: 1px solid rgba(255,255,255,0.14);
                      border-radius: 18px;
                      box-shadow: 0 24px 84px rgba(0,0,0,0.50);
                    "
                  >
                    <tr>
                      <td style="padding:28px 26px 22px 26px;">
                        <div style="text-align:center; margin-bottom:18px;">
                          <img
                            src="${LOGO_URL}"
                            width="140"
                            height="140"
                            alt="Lineup"
                            style="display:block; margin:0 auto; width:140px; height:140px; border-radius:20px;"
                          />
                        </div>

                        <div style="margin-top:16px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.88); text-align:left;">
                          <p style="margin:0 0 14px 0;">Vážený uživateli,</p>
                          <p style="margin:0 0 14px 0;">
                            v soutěži <strong style="color:#ffffff;">Daily Fantasy MS 2026</strong> na platformě <strong style="color:#ffffff;">Lineup</strong> jste získal
                            <strong style="color:#f1e6a8;">${pointsStr} bodů</strong> a umístil jste se na
                            <strong style="color:#f1e6a8;">${rankStr}</strong>.
                            Velmi si vážíme, že využíváte naši platformu a děkujeme za Vaši účast v soutěži.
                          </p>
                          <p style="margin:0 0 14px 0;">
                            Kompletní žebříček včetně rozpisu bodů po dnech najdete na našem webu —
                            <a href="${FANTASY_LEADERBOARD_URL}" style="color:#7dd3fc; font-weight:700; text-decoration:underline;">žebříček Daily Fantasy</a>.
                          </p>
                          <p style="margin:0 0 14px 0;">
                            Budeme velmi vděční, pokud platformu doporučíte svým známým a přátelům, nebo se zaregistrujete prostřednictvím banneru na našem webu do Tipsportu.
                          </p>
                          <p style="margin:0 0 6px 0;">
                            Moc Vám děkujeme za veškerou podporu a těšíme se na Vás u dalších soutěží na Lineup.
                          </p>
                          <p style="margin:0;"><strong style="color:#ffffff;">Tým Lineup</strong></p>
                        </div>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:22px 0 0 0;">
                          <tr>
                            <td align="center" style="padding-bottom:12px;">
                              <a href="${FANTASY_LEADERBOARD_URL}" style="display:inline-block; padding:13px 20px; border-radius:14px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight:900; letter-spacing:0.1em; text-transform:uppercase; font-size:12px; color:#03050a; text-decoration:none; background:linear-gradient(90deg, #00B4FF 0%, #0090cc 100%); box-shadow:0 10px 32px rgba(0,180,255,0.28);">
                                Žebříček Fantasy
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding-bottom:8px;">
                              <a href="${SITE_URL}" style="display:inline-block; padding:13px 20px; border-radius:14px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight:900; letter-spacing:0.1em; text-transform:uppercase; font-size:12px; color:#ffffff; text-decoration:none; background:linear-gradient(90deg, #003087 0%, #002a5c 42%, #c8102e 100%); box-shadow:0 12px 40px rgba(0,48,135,0.35);">
                                Navštívit hokejlineup.cz
                              </a>
                            </td>
                          </tr>
                        </table>

                        <div style="margin-top:18px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 12px; line-height: 1.5; color: rgba(255,255,255,0.52); text-align:center;">
                          Pokud tento e‑mail nechcete dostávat, odpovězte „odhlásit“.
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 8px 0 8px; text-align:center; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 11px; color: rgba(255,255,255,0.42);">
                © ${new Date().getFullYear()} Lineup · ${SITE_CANONICAL_HOST}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
}
