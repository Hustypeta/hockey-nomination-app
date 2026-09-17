-- Pool editoru sestavy na uložených share linkách (A-tým / U20 / ELH …).
ALTER TABLE "match_share_links" ADD COLUMN IF NOT EXISTS "poolKey" TEXT NOT NULL DEFAULT 'repre_a';

CREATE INDEX IF NOT EXISTS "match_share_links_poolKey_idx" ON "match_share_links"("poolKey");
