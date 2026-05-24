import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONTEST_ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";
import { listContestResultsRecipients } from "@/lib/emails/contestResultsRecipients";
import {
  CONTEST_RESULTS_EMAIL_SUBJECT,
  buildContestResultsThankYouHtml,
  buildContestResultsThankYouText,
} from "@/lib/emails/contestResultsThankYouEmail";
import { sendViaResend } from "@/lib/emails/sendViaResend";

const DEFAULT_CAMPAIGN_ID = "contest-results-thanks-2026-05";

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

type Body = {
  mode?: "dry-run" | "send";
  campaignId?: string;
  only?: string;
  throttleMs?: number;
};

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()) && !secretOk(req)) {
    return NextResponse.json({ error: "Neautorizováno." }, { status: 401 });
  }

  let body: Body = {};
  try {
    body = (await req.json().catch(() => ({}))) as Body;
  } catch {
    body = {};
  }

  const sp = req.nextUrl.searchParams;
  const mode = (body.mode ?? sp.get("mode")) === "send" ? "send" : "dry-run";
  const campaignId = (body.campaignId ?? sp.get("campaignId") ?? DEFAULT_CAMPAIGN_ID).trim();
  const only = (body.only ?? sp.get("only") ?? "").trim().toLowerCase() || null;
  const throttleMs = Math.max(0, Number(body.throttleMs ?? sp.get("throttleMs") ?? 350) || 350);

  const recipients = await listContestResultsRecipients();
  const filtered = only ? recipients.filter((r) => r.email.toLowerCase() === only) : recipients;

  if (mode === "dry-run") {
    return NextResponse.json({
      ok: true,
      mode,
      subject: CONTEST_RESULTS_EMAIL_SUBJECT,
      campaignId,
      count: filtered.length,
      recipients: filtered.map((r) => ({
        email: r.email,
        displayName: r.displayName,
        points: r.points,
        rank: r.rank,
      })),
    });
  }

  if (!campaignId) {
    return NextResponse.json({ error: "Chybí campaignId." }, { status: 400 });
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (const r of filtered) {
    try {
      const existing = await prisma.emailBroadcastSend.findUnique({
        where: { campaignId_email: { campaignId, email: r.email } },
        select: { status: true },
      });
      if (existing?.status === "sent") {
        skipped++;
        continue;
      }

      await prisma.emailBroadcastSend.upsert({
        where: { campaignId_email: { campaignId, email: r.email } },
        create: { campaignId, email: r.email, status: "sending" },
        update: { status: "sending", error: null },
      });

      const personalization = { points: r.points, rank: r.rank };
      const result = await sendViaResend({
        to: r.email,
        subject: CONTEST_RESULTS_EMAIL_SUBJECT,
        text: buildContestResultsThankYouText(personalization),
        html: buildContestResultsThankYouHtml(personalization),
      });

      await prisma.emailBroadcastSend.update({
        where: { campaignId_email: { campaignId, email: r.email } },
        data: { status: "sent", resendId: result.id ?? null, error: null },
      });

      sent++;
      if (throttleMs > 0) await sleep(throttleMs);
    } catch (e: unknown) {
      failed++;
      const msg = String(e instanceof Error ? e.message : e);
      errors.push({ email: r.email, error: msg });
      try {
        await prisma.emailBroadcastSend.upsert({
          where: { campaignId_email: { campaignId, email: r.email } },
          create: { campaignId, email: r.email, status: "failed", error: msg },
          update: { status: "failed", error: msg },
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
    attempted: filtered.length,
    sent,
    skipped,
    failed,
    errors: errors.slice(0, 20),
  });
}
