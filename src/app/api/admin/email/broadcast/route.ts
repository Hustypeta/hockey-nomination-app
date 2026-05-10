import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONTEST_ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";

// Stejné znění jako jednorázový test (`/api/admin/email/test`).
const SUBJECT = "Poslední den soutěže o dres!";
const TEXT =
  "Zdravím,\n\njen připomínám, že dnes v 19:30 je deadline soutěže o dres!\n\nDěkuji moc za využívání platformy Lineup.\n\nOtevřít editor: https://hokejlineup.cz/sestava\n";

const CTA_URL = "https://hokejlineup.cz/sestava";
const PREHEADER = "Dnes v 19:30 je deadline soutěže o dres — nezapomeň nominaci dokončit.";
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
                            Zdravím,
                          </p>
                          <p style="margin:0 0 10px 0;">
                            Jen připomínám, že <strong style="color:#ffffff;">dnes</strong> v <strong style="color:#ffffff;">19:30</strong> je deadline soutěže o dres!
                          </p>
                          <p style="margin:0;">
                            Děkuji moc za využívání platformy <strong style="color:#ffffff;">Lineup</strong>.
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

function pickFiniteNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/** Sjednocení klíčů: PascalCase, snake_case apod. (PowerShell proxy apod.). */
function canonicalKey(k: string) {
  return k.toLowerCase().replace(/_/g, "");
}

function pickFlexible(o: Record<string, unknown>, camelName: string): unknown {
  const want = canonicalKey(camelName);
  for (const [k, v] of Object.entries(o)) {
    if (canonicalKey(k) === want) return v;
  }
  return undefined;
}

/** PowerShell `ConvertTo-Json` + různé klíče v těle. */
function normalizeBroadcastBody(raw: unknown): BroadcastBody {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const out: BroadcastBody = {};

  const modeRaw = pickFlexible(o, "mode");
  if (modeRaw === "send") out.mode = "send";
  else if (modeRaw === "dry-run") out.mode = "dry-run";

  const cid = pickFlexible(o, "campaignId");
  if (typeof cid === "string" && cid.trim()) out.campaignId = cid.trim();

  const lim = pickFiniteNumber(pickFlexible(o, "limit"));
  if (lim !== undefined) out.limit = lim;

  const off = pickFiniteNumber(pickFlexible(o, "offset"));
  if (off !== undefined) out.offset = off;

  const thr = pickFiniteNumber(pickFlexible(o, "throttleMs"));
  if (thr !== undefined) out.throttleMs = thr;

  if (Boolean(pickFlexible(o, "retryFailed"))) out.retryFailed = true;

  return out;
}

function qpFirst(req: NextRequest, ...keys: string[]): string | undefined {
  const sp = req.nextUrl.searchParams;
  for (const k of keys) {
    const v = sp.get(k);
    const t = typeof v === "string" ? v.trim() : "";
    if (t) return t;
  }
  return undefined;
}

/** Když tělo/JSON nesedí, stačí hodnoty v URL (bez závislosti na `-Body`). */
function mergeBroadcastQuery(req: NextRequest, body: BroadcastBody): BroadcastBody {
  const out: BroadcastBody = { ...body };

  if (!out.campaignId?.trim()) {
    const c = qpFirst(req, "campaignId", "CampaignId");
    if (c) out.campaignId = c;
  }

  if (!out.mode) {
    const m = qpFirst(req, "mode", "Mode");
    if (m === "send") out.mode = "send";
    else if (m === "dry-run") out.mode = "dry-run";
  }

  const qLimit = pickFiniteNumber(qpFirst(req, "limit", "Limit"));
  if (out.limit === undefined && qLimit !== undefined) out.limit = qLimit;

  const qOff = pickFiniteNumber(qpFirst(req, "offset", "Offset"));
  if (out.offset === undefined && qOff !== undefined) out.offset = qOff;

  const qThr = pickFiniteNumber(qpFirst(req, "throttleMs", "ThrottleMs"));
  if (out.throttleMs === undefined && qThr !== undefined) out.throttleMs = qThr;

  if (!out.retryFailed) {
    const r = qpFirst(req, "retryFailed", "RetryFailed")?.toLowerCase();
    if (r === "1" || r === "true" || r === "yes") out.retryFailed = true;
  }

  return out;
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()) && !secretOk(req)) {
    return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
  }

  let body: BroadcastBody = {};
  try {
    body = normalizeBroadcastBody(await req.json().catch(() => ({})));
  } catch {
    body = {};
  }
  body = mergeBroadcastQuery(req, body);

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
    } catch (e: unknown) {
      failed++;
      errors.push({ to, error: String(e instanceof Error ? e.message : e) });
      try {
        await prisma.emailBroadcastSend.upsert({
          where: { campaignId_email: { campaignId, email: to } },
          create: {
            campaignId,
            email: to,
            status: "failed",
            error: String(e instanceof Error ? e.message : e),
          },
          update: { status: "failed", error: String(e instanceof Error ? e.message : e) },
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

