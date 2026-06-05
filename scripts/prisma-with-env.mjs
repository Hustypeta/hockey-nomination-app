/**
 * Spustí Prisma CLI s DATABASE_URL z `.env.local` / `.env` (stejně jako seed).
 * Použití: node scripts/prisma-with-env.mjs db push
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";

const root = process.cwd();
const localPath = join(root, ".env.local");
const envPath = join(root, ".env");

if (existsSync(localPath)) config({ path: localPath, override: true });
if (existsSync(envPath)) config({ path: envPath });

if (!process.env.DATABASE_URL?.trim()) {
  console.error(
    "Chybí DATABASE_URL. Přidej ji do .env.local (stejná jako pro npm run dev / Railway Postgres).",
  );
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Použití: node scripts/prisma-with-env.mjs <prisma příkaz…>");
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
