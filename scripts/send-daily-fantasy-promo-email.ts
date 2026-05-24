/**
 * Daily Fantasy promo — registrovaní bez nominační soutěže.
 *
 * Dry-run:
 *   npm run email:daily-fantasy-promo
 *
 * Test:
 *   npm run email:daily-fantasy-promo -- --only vase@email.cz --send --campaign-id test-daily-fantasy-1
 */
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: false });
dotenv.config({ path: path.resolve(process.cwd(), ".env"), override: false });

import { prisma } from "@/lib/prisma";
import { listDailyFantasyPromoRecipients } from "@/lib/emails/dailyFantasyPromoRecipients";
import {
  DAILY_FANTASY_PROMO_EMAIL_SUBJECT,
  buildDailyFantasyPromoHtml,
  buildDailyFantasyPromoText,
} from "@/lib/emails/dailyFantasyPromoEmail";
import { sendViaResend } from "@/lib/emails/sendViaResend";

function parseArgs(argv: string[]) {
  const out = {
    send: false,
    only: null as string | null,
    campaignId: null as string | null,
    throttleMs: 350,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--send") out.send = true;
    else if (a === "--only") out.only = String(argv[++i] ?? "").trim() || null;
    else if (a === "--campaign-id") out.campaignId = String(argv[++i] ?? "").trim() || null;
    else if (a === "--throttle-ms") out.throttleMs = Math.max(0, Number(argv[++i] ?? "350") || 350);
  }
  return out;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const recipients = await listDailyFantasyPromoRecipients();
  const filtered = args.only
    ? recipients.filter((r) => r.email.toLowerCase() === args.only!.toLowerCase())
    : recipients;

  console.log(`[daily-fantasy-promo] recipients=${filtered.length} mode=${args.send ? "SEND" : "DRY-RUN"}`);

  if (!filtered.length) {
    console.error("Žádní příjemci.");
    process.exitCode = 2;
    return;
  }

  for (const r of filtered) {
    console.log(`[${args.send ? "send" : "dry-run"}] ${r.email}`);
  }

  if (!args.send) {
    console.log("\nPro odeslání: --send --campaign-id daily-fantasy-promo-2026-05-v1");
    return;
  }

  if (!args.campaignId) {
    console.error("Chybí --campaign-id.");
    process.exitCode = 1;
    return;
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const r of filtered) {
    try {
      const existing = await prisma.emailBroadcastSend.findUnique({
        where: { campaignId_email: { campaignId: args.campaignId, email: r.email } },
        select: { status: true },
      });
      if (existing?.status === "sent") {
        skipped++;
        continue;
      }

      await prisma.emailBroadcastSend.upsert({
        where: { campaignId_email: { campaignId: args.campaignId, email: r.email } },
        create: { campaignId: args.campaignId, email: r.email, status: "sending" },
        update: { status: "sending", error: null },
      });

      const result = await sendViaResend({
        to: r.email,
        subject: DAILY_FANTASY_PROMO_EMAIL_SUBJECT,
        text: buildDailyFantasyPromoText(),
        html: buildDailyFantasyPromoHtml(),
      });

      await prisma.emailBroadcastSend.update({
        where: { campaignId_email: { campaignId: args.campaignId, email: r.email } },
        data: { status: "sent", resendId: result.id ?? null, error: null },
      });

      console.log(`[sent] ${r.email} id=${result.id ?? "?"}`);
      sent++;
      if (args.throttleMs > 0) await sleep(args.throttleMs);
    } catch (e: unknown) {
      failed++;
      const msg = String(e instanceof Error ? e.message : e);
      console.error(`[fail] ${r.email} ${msg}`);
      try {
        await prisma.emailBroadcastSend.upsert({
          where: { campaignId_email: { campaignId: args.campaignId, email: r.email } },
          create: { campaignId: args.campaignId, email: r.email, status: "failed", error: msg },
          update: { status: "failed", error: msg },
        });
      } catch {
        /* ignore */
      }
      if (args.throttleMs > 0) await sleep(Math.max(args.throttleMs, 600));
    }
  }

  console.log(`\n[done] sent=${sent} skipped=${skipped} failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
