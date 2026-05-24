import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAdminEmailSendParams, sliceRecipients } from "@/lib/adminEmailApiParams";
import { CONTEST_ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";
import { listDailyFantasyPromoRecipients } from "@/lib/emails/dailyFantasyPromoRecipients";
import {
  DAILY_FANTASY_PROMO_EMAIL_SUBJECT,
  buildDailyFantasyPromoHtml,
  buildDailyFantasyPromoText,
} from "@/lib/emails/dailyFantasyPromoEmail";
import { sendViaResend } from "@/lib/emails/sendViaResend";

const DEFAULT_CAMPAIGN_ID = "daily-fantasy-promo-2026-05";

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

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()) && !secretOk(req)) {
    return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const params = parseAdminEmailSendParams(req, body, {
    campaignId: DEFAULT_CAMPAIGN_ID,
    throttleMs: 350,
  });

  const all = await listDailyFantasyPromoRecipients();
  const byOnly = params.only
    ? all.filter((r) => r.email.toLowerCase() === params.only)
    : all;
  const filtered = sliceRecipients(byOnly, params.offset, params.limit);

  if (params.mode === "dry-run") {
    return NextResponse.json({
      ok: true,
      mode: params.mode,
      subject: DAILY_FANTASY_PROMO_EMAIL_SUBJECT,
      campaignId: params.campaignId || null,
      totalRecipients: all.length,
      count: filtered.length,
      offset: params.offset,
      limit: params.limit,
      recipients: filtered.map((r) => ({ email: r.email, userId: r.userId })),
    });
  }

  if (!params.campaignId) {
    return NextResponse.json({ error: "Chybí campaignId." }, { status: 400 });
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (const r of filtered) {
    try {
      const existing = await prisma.emailBroadcastSend.findUnique({
        where: { campaignId_email: { campaignId: params.campaignId, email: r.email } },
        select: { status: true },
      });
      if (existing?.status === "sent") {
        skipped++;
        continue;
      }
      if (existing?.status === "failed" && !params.retryFailed) {
        skipped++;
        continue;
      }

      await prisma.emailBroadcastSend.upsert({
        where: { campaignId_email: { campaignId: params.campaignId, email: r.email } },
        create: { campaignId: params.campaignId, email: r.email, status: "sending" },
        update: { status: "sending", error: null },
      });

      const result = await sendViaResend({
        to: r.email,
        subject: DAILY_FANTASY_PROMO_EMAIL_SUBJECT,
        text: buildDailyFantasyPromoText(),
        html: buildDailyFantasyPromoHtml(),
      });

      await prisma.emailBroadcastSend.update({
        where: { campaignId_email: { campaignId: params.campaignId, email: r.email } },
        data: { status: "sent", resendId: result.id ?? null, error: null },
      });

      sent++;
      if (params.throttleMs > 0) await sleep(params.throttleMs);
    } catch (e: unknown) {
      failed++;
      const msg = String(e instanceof Error ? e.message : e);
      errors.push({ email: r.email, error: msg });
      try {
        await prisma.emailBroadcastSend.upsert({
          where: { campaignId_email: { campaignId: params.campaignId, email: r.email } },
          create: { campaignId: params.campaignId, email: r.email, status: "failed", error: msg },
          update: { status: "failed", error: msg },
        });
      } catch {
        /* ignore */
      }
      if (params.throttleMs > 0) await sleep(Math.max(params.throttleMs, 600));
    }
  }

  return NextResponse.json({
    ok: failed === 0,
    mode: params.mode,
    campaignId: params.campaignId,
    totalRecipients: all.length,
    attempted: filtered.length,
    offset: params.offset,
    limit: params.limit,
    sent,
    skipped,
    failed,
    errors: errors.slice(0, 20),
  });
}
