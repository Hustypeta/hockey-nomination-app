import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CONTEST_ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";

const SUBJECT = "Lineup — poslední den 40 % bonusu";
const TEXT =
  "Velice Vám děkuji za Váš zájem o platformu Lineup.\n\nNezapomeňte, že se dnes blíží poslední den pro odeslání nominace do soutěže s 40 % bonusem.\n\nRisk je zisk!\n\nOtevřít editor: https://hokejlineup.cz/sestava\n";

const CTA_URL = "https://hokejlineup.cz/sestava";
const PREHEADER = "Dnes končí 40 % bonus — odešli nominaci včas.";

const HTML = `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${SUBJECT}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#0c0e12;">
    <!-- Preheader (hidden) -->
    <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
      ${PREHEADER}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0c0e12; width:100%;">
      <tr>
        <td align="center" style="padding:28px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="width:100%; max-width:640px;">
            <tr>
              <td style="padding:0;">
                <!-- Glow background -->
                <div
                  style="
                    background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,63,135,0.55) 0%, rgba(0,0,0,0) 55%);
                    padding: 24px;
                    border-radius: 22px;
                  "
                >
                  <!-- Card -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                    style="
                      width:100%;
                      background-color: rgba(21,25,34,0.92);
                      border: 1px solid #2a3142;
                      border-radius: 18px;
                      box-shadow: 0 24px 80px rgba(0,0,0,0.45);
                    "
                  >
                    <tr>
                      <td style="padding:28px 22px; text-align:center;">
                        <!-- Logo circle -->
                        <div
                          style="
                            width: 152px;
                            height: 152px;
                            margin: 0 auto 18px auto;
                            border-radius: 9999px;
                            background-color: rgba(0,63,135,0.08);
                            border: 4px solid rgba(0,63,135,0.45);
                            box-shadow: inset 0 0 36px rgba(0,63,135,0.15);
                            display: table;
                          "
                        >
                          <div style="display: table-cell; vertical-align: middle; text-align:center;">
                            <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight: 800; letter-spacing: 0.20em; font-size: 34px; color: rgba(0,63,135,0.95);">
                              ČR
                            </div>
                          </div>
                        </div>

                        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight: 900; letter-spacing: 0.14em; font-size: 28px; color:#ffffff;">
                          Lineup
                        </div>
                        <div style="margin-top:6px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-weight: 700; letter-spacing: 0.18em; font-size: 12px; color: rgba(196,30,58,0.92); text-transform: uppercase;">
                          MS 2026 · nominace
                        </div>

                        <div style="margin-top:18px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.82); text-align:left;">
                          <p style="margin:0 0 12px 0;">
                            Velice Vám děkuji za Váš zájem o platformu <strong style="color:#ffffff;">Lineup</strong>.
                          </p>
                          <p style="margin:0 0 12px 0;">
                            Nezapomeňte, že se dnes blíží poslední den pro odeslání nominace do soutěže s
                            <strong style="color:#ffffff;">40&nbsp;% bonusem</strong>.
                          </p>
                          <p style="margin:0 0 0 0;">
                            <strong style="color:#ffffff;">Risk je zisk!</strong>
                          </p>
                        </div>

                        <!-- CTA button -->
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px auto 0 auto;">
                          <tr>
                            <td align="center" bgcolor="#003087" style="border-radius: 14px;">
                              <a
                                href="${CTA_URL}"
                                style="
                                  display:inline-block;
                                  padding: 14px 18px;
                                  border-radius: 14px;
                                  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
                                  font-weight: 900;
                                  letter-spacing: 0.12em;
                                  text-transform: uppercase;
                                  font-size: 13px;
                                  color: #ffffff;
                                  text-decoration:none;
                                  background: linear-gradient(90deg, #003087 0%, #002056 100%);
                                  box-shadow: 0 8px 28px rgba(0,48,135,0.45);
                                "
                              >
                                Otevřít editor nominace
                              </a>
                            </td>
                          </tr>
                        </table>

                        <div style="margin-top:18px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 12px; line-height: 1.5; color: rgba(255,255,255,0.55);">
                          Pokud tenhle e‑mail nechceš dostávat, odpověz “odhlásit”.
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 8px 0 8px; text-align:center; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 11px; color: rgba(255,255,255,0.42);">
                © ${new Date().getFullYear()} Lineup · hokejlineup.cz
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();

async function requireAdmin(): Promise<boolean> {
  const token = (await cookies()).get(CONTEST_ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}

function secretOk(req: NextRequest): boolean {
  const required = process.env.EMAIL_BROADCAST_SECRET;
  if (!required) return false;
  const header = req.headers.get("x-email-secret")?.trim();
  const query = req.nextUrl.searchParams.get("secret")?.trim();
  return Boolean((header && header === required) || (query && query === required));
}

async function resendSendSingle(to: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  const replyTo = (process.env.RESEND_REPLY_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const listUnsubMailto =
    process.env.RESEND_LIST_UNSUBSCRIBE_MAILTO?.trim() || replyTo[0] || "info@hokejlineup.cz";

  if (!apiKey) throw new Error("Missing env RESEND_API_KEY");
  if (!from) throw new Error("Missing env RESEND_FROM");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: SUBJECT,
      ...(replyTo.length ? { reply_to: replyTo } : {}),
      headers: {
        // Pomáhá doručitelnosti + některé klienty ukážou odhlášení (aspoň mailto).
        "List-Unsubscribe": `<mailto:${listUnsubMailto}?subject=unsubscribe>`,
      },
      text: TEXT,
      html: HTML,
    }),
  });

  const body = await res.text();
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${body}`);
  try {
    return JSON.parse(body) as { id?: string };
  } catch {
    return {} as { id?: string };
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()) && !secretOk(req)) {
    return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const to = typeof body?.to === "string" ? body.to.trim() : "";
    if (!to || !to.includes("@")) {
      return NextResponse.json({ error: "Chybí 'to' (email)." }, { status: 400 });
    }

    const r = await resendSendSingle(to);
    return NextResponse.json({ ok: true, id: r.id ?? null });
  } catch (e) {
    console.error("admin email test POST:", e);
    return NextResponse.json({ error: "Odeslání se nepovedlo." }, { status: 500 });
  }
}

