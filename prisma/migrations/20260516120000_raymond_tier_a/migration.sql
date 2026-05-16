-- Švédsko: Lucas Raymond, Mattias Ekholm → tier A. Odevzdané sestavy: plat/tier ze snímku pickSalaries / pickTiers.
UPDATE "ms_fantasy_roster_players"
SET "tier" = 'A', "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" IN ('SWE26-F23-RAYMOND', 'SWE26-D14-EKHOLM')
  AND "tier" IS DISTINCT FROM 'A';
