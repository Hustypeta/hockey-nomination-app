import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONTEST_ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";

// Reuse the same subject/body as the single-send endpoint:
const SUBJECT = "Lineup — poslední den 40 % bonusu";
const TEXT =
  "Velice Vám děkuji za Váš zájem o platformu Lineup.\n\nNezapomeňte, že se dnes blíží poslední den pro odeslání nominace do soutěže s 40 % bonusem.\n\nRisk je zisk!\n\nOtevřít editor: https://hokejlineup.cz/sestava\n";

const CTA_URL = "https://hokejlineup.cz/sestava";
const PREHEADER = "Dnes končí 40 % bonus — odešli nominaci včas.";
const LOGO_URL = "https://hokejlineup.cz/images/logo.png";

const HTML = `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${SUBJECT}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#0c0e12;">
    <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
      ${PREHEADER}
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
                      <td style="padding:26px 22px; text-align:center;">
                        <div style="margin: 2px auto 10px auto; text-align:center;">
                          <img
                            src="${LOGO_URL}"
                            width="120"
                            height="120"
                            alt="Lineup"
                            style="display:block; margin:0 auto; width:120px; height:120px; border-radius:18px;"
                          />
                        </div>

                        <div style="margin-top:16px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 15px; line-height: 1.65; color: rgba(255,255,255,0.86); text-align:center;">
                          <p style="margin:0 0 10px 0;">
                            Velice Vám děkuji za Váš zájem o platformu <strong style="color:#ffffff;">Lineup</strong>.
                          </p>
                          <p style="margin:0 0 10px 0;">
                            Dnes je poslední den pro odeslání nominace do soutěže s <strong style="color:#ffffff;">40&nbsp;% bonusem</strong>.
                          </p>
                          <p style="margin:0;">
                            <strong style="color:#ffffff;">Risk je zisk!</strong>
                          </p>
                        </div>

                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px auto 0 auto;">
                          <tr>
                            <td align="center" bgcolor="#003087" style="border-radius: 14px;">
                              <a
                                href="${CTA_URL}"
                                style="
                                  display:inline-block;
                                  padding: 14px 22px;
                                  border-radius: 18px;
                                  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
                                  font-weight: 900;
                                  letter-spacing: 0.12em;
                                  text-transform: uppercase;
                                  font-size: 13px;
                                  color: #ffffff;
                                  text-decoration:none;
                                  background: linear-gradient(90deg, #003087 0%, #002a5c 42%, #c8102e 100%);
                                  box-shadow: 0 12px 40px rgba(0,48,135,0.35), 0 0 30px rgba(200,16,46,0.12);
                                "
                              >
                                Otevřít editor nominace
                              </a>
                            </td>
                          </tr>
                        </table>

                        <div style="margin-top:14px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 12px; line-height: 1.5; color: rgba(255,255,255,0.58);">
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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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

type BroadcastBody = {
  mode?: "dry-run" | "send";
  /** Povinné pro bezpečné ostré odeslání (idempotence). Např. "deadline-40-2026-04-30". */
  campaignId?: string;
  limit?: number;
  offset?: number;
  throttleMs?: number;
  /** Pokud true, zkusí znovu odeslat i záznamy se statusem "failed". */
  retryFailed?: boolean;
};

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()) && !secretOk(req)) {
    return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
  }

  let body: BroadcastBody = {};
  try {
    body = (await req.json()) as BroadcastBody;
  } catch {
    body = {};
  }

  const mode = body.mode === "send" ? "send" : "dry-run";
  const campaignId = typeof body.campaignId === "string" ? body.campaignId.trim() : "";
  const limit = typeof body.limit === "number" && Number.isFinite(body.limit) ? Math.max(1, Math.floor(body.limit)) : null;
  const offset = typeof body.offset === "number" && Number.isFinite(body.offset) ? Math.max(0, Math.floor(body.offset)) : 0;
  const throttleMs =
    typeof body.throttleMs === "number" && Number.isFinite(body.throttleMs) ? Math.max(0, Math.floor(body.throttleMs)) : 350;
  const retryFailed = Boolean(body.retryFailed);

  const users = await prisma.user.findMany({
    where: { email: { not: null } },
    select: { email: true },
    orderBy: { id: "asc" },
    skip: offset,
    take: limit ?? undefined,
  });

  const emails = users.map((u) => (u.email ?? "").trim()).filter(Boolean);

  if (mode === "dry-run") {
    return NextResponse.json({
      ok: true,
      mode,
      campaignId: campaignId || null,
      offset,
      limit,
      count: emails.length,
      sample: emails.slice(0, 10),
    });
  }

  if (!campaignId) {
    return NextResponse.json(
      { error: "Chybí campaignId (povinné pro odeslání, aby se nic neposlalo 2×)." },
      { status: 400 }
    );
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const errors: Array<{ to: string; error: string }> = [];

  for (const to of emails) {
    try {
      const existing = await prisma.emailBroadcastSend.findUnique({
        where: { campaignId_email: { campaignId, email: to } },
        select: { status: true },
      });
      if (existing?.status === "sent") {
        skipped++;
        continue;
      }
      if (existing?.status === "failed" && !retryFailed) {
        skipped++;
        continue;
      }

      // Založ/označ záznam předem: idempotence i při dvojím spuštění.
      await prisma.emailBroadcastSend.upsert({
        where: { campaignId_email: { campaignId, email: to } },
        create: { campaignId, email: to, status: "sending" },
        update: { status: "sending", error: null },
      });

      const r = await resendSendSingle(to);
      await prisma.emailBroadcastSend.update({
        where: { campaignId_email: { campaignId, email: to } },
        data: { status: "sent", resendId: r.id ?? null, error: null },
      });
      sent++;
      if (throttleMs > 0) await sleep(throttleMs);
    } catch (e: any) {
      failed++;
      errors.push({ to, error: String(e?.message ?? e) });
      try {
        await prisma.emailBroadcastSend.upsert({
          where: { campaignId_email: { campaignId, email: to } },
          create: { campaignId, email: to, status: "failed", error: String(e?.message ?? e) },
          update: { status: "failed", error: String(e?.message ?? e) },
        });
      } catch {
        /* ignore */
      }
      if (throttleMs > 0) await sleep(Math.max(throttleMs, 600));
    }
  }

  return NextResponse.json({
    ok: failed === 0,
    mode,
    campaignId,
    offset,
    limit,
    attempted: emails.length,
    sent,
    skipped,
    failed,
    errors: errors.slice(0, 20),
  });
}

