/**
 * Idempotent lineup DB guard:
 *   1) prisma generate
 *   2) prisma db push (adds players.poolKey / updatedAt / MatchShareLink.poolKey if missing)
 *   3) verify Player.poolKey query works + pools look healthy
 *   4) if schema still missing → one more db push + re-verify (heals mid-session wipes)
 *   5) if pools collapsed into repre_a / empty → auto-run import:lineup-pools
 *
 * Usage: npm run db:ensure
 * Wired as predev — must not hard-block `npm run dev` on fixable pool data issues.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { config } from "dotenv";

const root = process.cwd();
const require = createRequire(import.meta.url);

if (existsSync(join(root, ".env.local"))) config({ path: join(root, ".env.local"), override: true });
if (existsSync(join(root, ".env"))) config({ path: join(root, ".env") });

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
if (!databaseUrl) {
  console.error(
    "[db:ensure] Chybí DATABASE_URL. Přidej ji do .env.local — ideálně localhost Postgres.\n" +
      "  Viz .env.local.example a docker-compose.yml (docker compose up -d)."
  );
  process.exit(1);
}

function databaseHostKind(url) {
  if (/localhost|127\.0\.0\.1/i.test(url)) return "localhost";
  if (/railway|rlwy\.net|proxy\.rlwy/i.test(url)) return "railway";
  return "remote";
}

const hostKind = databaseHostKind(databaseUrl);
if (hostKind === "railway") {
  console.warn(
    "[db:ensure] DATABASE_URL směřuje na Railway Postgres.\n" +
      "  Pokud production na Railway běží staré `main` s `db push --accept-data-loss`,\n" +
      "  restart služby může smazat players.poolKey uprostřed lokálního vývoje.\n" +
      "  Doporučení: lokální Postgres (docker compose up -d) a DATABASE_URL=localhost — viz .env.local.example.\n" +
      "  Alternativa: vypni Railway web service, dokud vyvíjíš proti stejné DB."
  );
} else if (hostKind === "localhost") {
  console.log("[db:ensure] DATABASE_URL → localhost (OK pro lokální vývoj).");
}

function runPrisma(args, { allowFail = false } = {}) {
  console.log(`[db:ensure] npx prisma ${args.join(" ")}`);
  const result = spawnSync("npx", ["prisma", ...args], {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  const code = result.status ?? 1;
  if (code !== 0 && !allowFail) {
    console.error(`[db:ensure] prisma ${args[0]} selhalo (exit ${code}).`);
    process.exit(code);
  }
  return code;
}

function runImport() {
  console.warn(
    "[db:ensure] Spouštím auto-import lineup poolů (npm run import:lineup-pools)…"
  );
  const result = spawnSync("npm", ["run", "import:lineup-pools"], {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
    cwd: root,
  });
  const code = result.status ?? 1;
  if (code !== 0) {
    console.warn(
      `[db:ensure] import:lineup-pools selhal (exit ${code}). Dev server stejně nastartuje — oprav ručně.`
    );
  }
  return code;
}

function isMissingPoolKeyError(e) {
  const msg = String(e?.message ?? e);
  const code = e?.code;
  const col = String(e?.meta?.column ?? "");
  return (
    code === "P2022" &&
    (/players\.poolKey/i.test(msg) || /(?:^|[.\s"])poolKey(?:$|[.\s"])/i.test(col + " " + msg))
  ) || /poolKey/i.test(msg);
}

const genCode = runPrisma(["generate"], { allowFail: true });
if (genCode !== 0) {
  console.warn(
    "[db:ensure] prisma generate selhalo (často EPERM — `next dev` drží query engine). Pokračuji s db push + verify."
  );
}

runPrisma(["db", "push", "--skip-generate"]);

/**
 * @returns {{ total: number, repreA: number, elh: number, pools: number } | null}
 * null = schema/query failure (fatal)
 */
async function readPoolHealth(prisma) {
  const counts = await prisma.player.groupBy({
    by: ["poolKey"],
    _count: { _all: true },
    orderBy: { poolKey: "asc" },
  });
  const total = counts.reduce((s, c) => s + c._count._all, 0);
  const repreA = counts.find((c) => c.poolKey === "repre_a")?._count._all ?? 0;
  const elh = counts
    .filter((c) => c.poolKey.startsWith("elh:"))
    .reduce((s, c) => s + c._count._all, 0);
  return { total, repreA, elh, pools: counts.length };
}

function poolDataIssue(h) {
  if (h.total === 0) return "empty";
  if (h.elh === 0 && h.repreA === h.total && h.total > 220) return "all_in_repre_a";
  if (h.repreA === 0) return "repre_a_empty";
  return null;
}

function makePrisma() {
  const { PrismaClient } = require("@prisma/client");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

async function verifyOnce(prisma) {
  return readPoolHealth(prisma);
}

async function verify() {
  let prisma = makePrisma();

  try {
    let health;
    try {
      health = await verifyOnce(prisma);
    } catch (e) {
      if (!isMissingPoolKeyError(e)) throw e;
      console.warn(
        "[db:ensure] players.poolKey chybí po prvním db push — zkouším znovu db push (auto-heal)…"
      );
      await prisma.$disconnect().catch(() => {});
      const pushCode = runPrisma(["db", "push", "--skip-generate"], { allowFail: true });
      if (pushCode !== 0) {
        console.error(
          "[db:ensure] druhý db push selhal. Zkontroluj DATABASE_URL / že Postgres běží."
        );
        process.exit(pushCode);
      }
      prisma = makePrisma();
      try {
        health = await verifyOnce(prisma);
      } catch (e2) {
        if (isMissingPoolKeyError(e2)) {
          console.error(
            "[db:ensure] players.poolKey stále chybí po opakovaném db push.\n" +
              (hostKind === "railway"
                ? "  Railway production pravděpodobně právě shodila schéma — přepni na localhost Postgres\n" +
                  "  (docker compose up -d + .env.local.example) nebo vypni Railway web service.\n"
                : "  Zkus: npm run db:push && npm run db:generate\n") +
              "  Pak:   npm run import:lineup-pools"
          );
          process.exit(1);
        }
        throw e2;
      }
    }

    console.log(
      `[db:ensure] OK poolKey query — total=${health.total}, repre_a=${health.repreA}, elh=${health.elh}, pools=${health.pools}`
    );

    let issue = poolDataIssue(health);
    if (issue) {
      const labels = {
        empty: "players tabulka je prázdná",
        all_in_repre_a: `všichni hráči (${health.total}) jsou v repre_a — ELH pooly chybí`,
        repre_a_empty: "repre_a je prázdný",
      };
      console.warn(`[db:ensure] ${labels[issue]} — zkouším auto-import.`);
      await prisma.$disconnect();
      runImport();

      const prisma2 = makePrisma();
      try {
        health = await readPoolHealth(prisma2);
        console.log(
          `[db:ensure] po importu — total=${health.total}, repre_a=${health.repreA}, elh=${health.elh}, pools=${health.pools}`
        );
        issue = poolDataIssue(health);
        if (issue) {
          console.warn(
            `[db:ensure] Pooly stále nejsou v pořádku (${issue}). ` +
              "Dev server se spustí — spusť ručně: npm run import:lineup-pools"
          );
          // Soft-fail: never block `npm run dev` on fixable data shape.
          return;
        }
      } finally {
        await prisma2.$disconnect();
      }
      return;
    }
  } catch (e) {
    const msg = String(e?.message ?? e);
    if (isMissingPoolKeyError(e)) {
      console.error(
        "[db:ensure] players.poolKey stále chybí po db push.\n" +
          "  Zkus: npm run db:push && npm run db:generate\n" +
          "  Pak:   npm run import:lineup-pools"
      );
    } else {
      console.error("[db:ensure] verify selhalo:", e);
    }
    // Soft-fail on localhost so a transient connection blip doesn't block dev;
    // hard-fail on Railway/remote where silent start would mask real schema fights.
    if (hostKind === "localhost" && !/poolKey/i.test(msg)) {
      console.warn("[db:ensure] pokračuji (localhost) — oprav DB ručně pokud editor selže.");
      return;
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

await verify();
console.log("[db:ensure] hotovo.");
