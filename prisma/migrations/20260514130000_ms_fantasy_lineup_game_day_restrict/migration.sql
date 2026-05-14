-- Odevzdané lineupy nesmí zmizet při omylu smazaném hracím dni: místo CASCADE použij RESTRICT.
ALTER TABLE "ms_fantasy_lineups" DROP CONSTRAINT IF EXISTS "ms_fantasy_lineups_gameDayId_fkey";
ALTER TABLE "ms_fantasy_lineups"
  ADD CONSTRAINT "ms_fantasy_lineups_gameDayId_fkey"
  FOREIGN KEY ("gameDayId") REFERENCES "ms_fantasy_game_days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
