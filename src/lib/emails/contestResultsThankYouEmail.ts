import { MERKURXTIP_PROMO_HREF_LANDING, MERKURXTIP_PROMO_IMAGE_SRC } from "@/lib/merkurXtipPromo";
import { SITE_CANONICAL_HOST } from "@/lib/siteBranding";

const SITE_URL = `https://${SITE_CANONICAL_HOST}`;
const FANTASY_URL = `${SITE_URL}/fantasy`;
const LOGO_URL = `${SITE_URL}/images/logo.png`;

export const CONTEST_RESULTS_EMAIL_SUBJECT = "Výsledek nominační soutěže Lineup";

export type ContestResultsEmailPersonalization = {
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

export function buildContestResultsThankYouText({ points, rank }: ContestResultsEmailPersonalization): string {
  return [
    "Vážený uživateli,",
    "",
    `v nominační soutěži od Lineupu jste získal ${points} bodů a umístil jste se na ${rankPhrase(rank)}.`,
    "",
    "Rád bych Vás také informoval, že stále běží Daily Fantasy, ve které hrajeme o finanční odměny. Celkový vítěz získá 500 Kč a navíc na konci náhodně vylosujeme 5 dalších soutěžících, z nichž každý obdrží 200 Kč.",
    "",
    `Jelikož na celém tomto projektu pracuji sám, chtěl bych Vás poprosit, zda byste si nenašel čas navštívit náš web (${SITE_URL}), kliknout na banner MerkurXtip a zaregistrovat se (případně si i vsadit). Každá taková aktivita mi pomůže projekt dále rozvíjet. Budu také velmi vděčný, pokud tuto platformu doporučíte svým známým a přátelům.`,
    "",
    "Moc Vám děkuji za podporu.",
    "",
    "S pozdravem",
    "Lineup",
    "",
    `Fantasy: ${FANTASY_URL}`,
    `Web: ${SITE_URL}`,
    `MerkurXtip: ${MERKURXTIP_PROMO_HREF_LANDING}`,
  ].join("\n");
}

export function buildContestResultsThankYouHtml({
  points,
  rank,
}: ContestResultsEmailPersonalization): string {
  const preheader = `Nominační soutěž: ${points} bodů, ${rank}. místo — Daily Fantasy a podpora projektu.`;
  const pointsStr = escapeHtml(String(points));
  const rankStr = escapeHtml(rankPhrase(rank));

  return `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(CONTEST_RESULTS_EMAIL_SUBJECT)}</title>
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
                            width="96"
                            height="96"
                            alt="Lineup"
                            style="display:block; margin:0 auto; width:96px; height:96px; border-radius:16px;"
                          />
                        </div>

                        <div style="margin:0 0 18px 0; padding:14px 16px; border-radius:14px; border:1px solid rgba(241,196,15,0.35); background:linear-gradient(90deg, rgba(241,196,15,0.12) 0%, rgba(200,16,46,0.10) 100%); text-align:center;">
                          <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:11px; font-weight:800; letter-spacing:0.18em; text-transform:uppercase; color:rgba(241,230,168,0.9);">
                            Nominační soutěž MS 2026
                          </div>
                          <div style="margin-top:8px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:26px; font-weight:900; color:#ffffff; line-height:1.2;">
                            ${pointsStr} bodů
                          </div>
                          <div style="margin-top:4px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:15px; font-weight:700; color:rgba(255,255,255,0.88);">
                            ${rankStr}
                          </div>
                        </div>

                        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.88); text-align:left;">
                          <p style="margin:0 0 14px 0;">Vážený uživateli,</p>
                          <p style="margin:0 0 14px 0;">
                            v nominační soutěži od <strong style="color:#ffffff;">Lineupu</strong> jste získal
                            <strong style="color:#f1e6a8;"> ${pointsStr} bodů</strong> a umístil jste se na
                            <strong style="color:#f1e6a8;"> ${rankStr}</strong>.
                          </p>
                          <p style="margin:0 0 14px 0;">
                            Rád bych Vás také informoval, že stále běží <strong style="color:#ffffff;">Daily Fantasy</strong>,
                            ve které hrajeme o finanční odměny. Celkový vítěz získá <strong style="color:#ffffff;">500&nbsp;Kč</strong>
                            a navíc na konci náhodně vylosujeme <strong style="color:#ffffff;">5</strong> dalších soutěžících,
                            z nichž každý obdrží <strong style="color:#ffffff;">200&nbsp;Kč</strong>.
                          </p>
                          <p style="margin:0 0 14px 0;">
                            Jelikož na celém tomto projektu pracuji sám, chtěl bych Vás poprosit, zda byste si nenašel čas
                            <a href="${SITE_URL}" style="color:#7dd3fc; font-weight:700; text-decoration:underline;">navštívit náš web</a>,
                            kliknout na banner <strong style="color:#f1c40f;">MerkurXtip</strong> a zaregistrovat se (případně si i vsadit).
                            Každá taková aktivita mi pomůže projekt dále rozvíjet. Budu také velmi vděčný, pokud tuto platformu
                            doporučíte svým známým a přátelům.
                          </p>
                          <p style="margin:0 0 6px 0;">Moc Vám děkuji za podporu.</p>
                          <p style="margin:0;">S pozdravem<br /><strong style="color:#ffffff;">Lineup</strong></p>
                        </div>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:22px 0 0 0;">
                          <tr>
                            <td align="center" style="padding-bottom:12px;">
                              <a href="${FANTASY_URL}" style="display:inline-block; padding:13px 20px; border-radius:14px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight:900; letter-spacing:0.1em; text-transform:uppercase; font-size:12px; color:#03050a; text-decoration:none; background:linear-gradient(90deg, #00B4FF 0%, #0090cc 100%); box-shadow:0 10px 32px rgba(0,180,255,0.28);">
                                Daily Fantasy
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

                        <div style="margin-top:18px; text-align:center;">
                          <a href="${MERKURXTIP_PROMO_HREF_LANDING}" style="text-decoration:none;">
                            <img
                              src="${MERKURXTIP_PROMO_IMAGE_SRC}"
                              alt="MerkurXtip — partnerská nabídka"
                              width="560"
                              style="display:block; margin:0 auto; max-width:100%; width:100%; height:auto; border-radius:12px; border:1px solid rgba(255,255,255,0.12);"
                            />
                          </a>
                          <p style="margin:10px 0 0 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:12px; color:rgba(255,255,255,0.55);">
                            Klikněte na banner <a href="${MERKURXTIP_PROMO_HREF_LANDING}" style="color:#f1c40f; font-weight:700;">MerkurXtip</a> — registrace nebo sázka projekt podpoří.
                          </p>
                        </div>

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
