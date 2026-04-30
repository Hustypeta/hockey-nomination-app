import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CONTEST_ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";

const SUBJECT = "Lineup — poslední den 40 % bonusu";
const TEXT =
  "Velice Vám děkuji za Váš zájem o platformu Lineup.\n\nNezapomeňte, že se dnes blíží poslední den pro odeslání nominace do soutěže s 40 % bonusem.\n\nRisk je zisk!\n";
const HTML = `
<div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5; color: #0f172a;">
  <p>Velice Vám děkuji za Váš zájem o platformu <strong>Lineup</strong>.</p>
  <p>
    Nezapomeňte, že se dnes blíží poslední den pro odeslání nominace do soutěže s <strong>40&nbsp;% bonusem</strong>.
  </p>
  <p><strong>Risk je zisk!</strong></p>
</div>
`.trim();

async function requireAdmin(): Promise<boolean> {
  const token = (await cookies()).get(CONTEST_ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}

function secretOk(req: NextRequest): boolean {
  const required = process.env.EMAIL_BROADCAST_SECRET;
  if (!required) return false;
  const header = req.headers.get("x-email-secret")?.trim();
  const query = req.nextUrl.searchParams.get("secret")?.trim();
  return (header && header === required) || (query && query === required);
}

async function resendSendSingle(to: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  const replyTo = (process.env.RESEND_REPLY_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

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

