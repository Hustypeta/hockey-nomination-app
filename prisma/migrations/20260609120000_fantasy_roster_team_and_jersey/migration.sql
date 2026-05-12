-- Align roster with Excel: country → team, optional jersey number
ALTER TABLE "ms_fantasy_roster_players" RENAME COLUMN "country" TO "team";

ALTER TABLE "ms_fantasy_roster_players" ADD COLUMN "jerseyNumber" INTEGER;
