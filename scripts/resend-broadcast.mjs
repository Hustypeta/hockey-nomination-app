import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Načti env stejně jako Next (lokálně typicky .env.local).
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

function parseArgs(argv) {
  const out = { send: false, limit: null, offset: 0, only: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--send") out.send = true;
    else if (a === "--dry-run") out.send = false;
    else if (a === "--limit") out.limit = Number(argv[++i] ?? "0") || null;
    else if (a === "--offset") out.offset = Number(argv[++i] ?? "0") || 0;
    else if (a === "--only") out.only = String(argv[++i] ?? "").trim() || null;
  }
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const SUBJECT =
  "Lineup — poslední den 40 % bonusu";
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

async function resendSend({ apiKey, from, to, subject, text, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html,
    }),
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
  try {
    return JSON.parse(body);
  } catch {
    return { ok: true, raw: body };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = args.send ? requireEnv("RESEND_API_KEY") : null;
  const from = args.send ? requireEnv("RESEND_FROM") : null; // e.g. "Lineup <info@hokejlineup.cz>"

  const prisma = new PrismaClient();
  try {
    const where = {
      email: { not: null },
    };
    const users = await prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true },
      orderBy: { id: "asc" },
      skip: args.offset,
      take: args.limit ?? undefined,
    });

    const emails = users
      .map((u) => (u.email ?? "").trim())
      .filter(Boolean)
      .filter((e) => (args.only ? e.toLowerCase() === args.only.toLowerCase() : true));

    console.log(
      `[broadcast] users=${users.length} emails=${emails.length} mode=${args.send ? "SEND" : "DRY-RUN"}`
    );
    if (!args.send) {
      console.log("[broadcast] Add --send to actually send emails.");
    }

    let ok = 0;
    let fail = 0;
    for (const to of emails) {
      if (!args.send) {
        console.log(`[dry-run] to=${to}`);
        ok++;
        continue;
      }
      try {
        const result = await resendSend({
          apiKey,
          from,
          to,
          subject: SUBJECT,
          text: TEXT,
          html: HTML,
        });
        console.log(`[sent] to=${to} id=${result?.id ?? "?"}`);
        ok++;
        // jednoduchý rate-limit: ~3 req/s
        await sleep(350);
      } catch (e) {
        console.error(`[fail] to=${to} err=${e?.message ?? e}`);
        fail++;
        await sleep(600);
      }
    }

    console.log(`[broadcast] done ok=${ok} fail=${fail}`);
    if (args.send && fail > 0) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

