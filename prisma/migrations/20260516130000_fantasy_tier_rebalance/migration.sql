-- Úprava tierů v poolu (odevzdané sestavy: plat/tier ze snímku pickSalaries / pickTiers).
-- Itálie: všichni o jeden tier „dolů“ (C→D, D→E).
UPDATE "ms_fantasy_roster_players"
SET "tier" = CASE "tier"
  WHEN 'C' THEN 'D'
  WHEN 'D' THEN 'E'
  ELSE "tier"
END,
"updatedAt" = CURRENT_TIMESTAMP
WHERE "team" = 'ITA' AND "tier" IN ('C', 'D');

-- Finsko, Švédsko, Švýcarsko: E → D.
UPDATE "ms_fantasy_roster_players"
SET "tier" = 'D', "updatedAt" = CURRENT_TIMESTAMP
WHERE "team" IN ('FIN', 'SWE', 'SUI') AND "tier" = 'E';
