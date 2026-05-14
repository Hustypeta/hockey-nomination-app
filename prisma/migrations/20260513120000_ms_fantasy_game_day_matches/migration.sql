-- Soupis zápasů MS 2026 pro fantasy den (JSON pole); uzávěrka lockAt = první buly dne (nebo explicitně u pauzy).
ALTER TABLE "ms_fantasy_game_days" ADD COLUMN "matches" JSONB NOT NULL DEFAULT '[]'::jsonb;
