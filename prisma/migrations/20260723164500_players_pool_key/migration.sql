-- Ensure lineup editor pool columns exist on players (repre_a / elh:…).
-- Previously only applied via `db push`; without this migrate-deploy envs lose the column.
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "jerseyNumber" INTEGER;
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "poolKey" TEXT NOT NULL DEFAULT 'repre_a';
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "players_poolKey_idx" ON "players"("poolKey");
