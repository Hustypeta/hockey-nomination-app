-- Snímek tierů + platů při odevzdání (historické sestavy nezávislé na pozdější změně tieru v poolu).
ALTER TABLE "ms_fantasy_lineups" ADD COLUMN "pickTiers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ms_fantasy_lineups" ADD COLUMN "pickSalaries" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[];

CREATE OR REPLACE FUNCTION _ms_fantasy_salary_for_snapshot(t TEXT, p TEXT) RETURNS INTEGER AS $$
DECLARE
  tu TEXT := upper(trim(t));
  pu TEXT := upper(trim(p));
BEGIN
  IF pu = 'G' THEN
    RETURN CASE tu
      WHEN 'A' THEN 45
      WHEN 'B' THEN 35
      WHEN 'C' THEN 28
      WHEN 'D' THEN 22
      ELSE 18
    END;
  ELSE
    RETURN CASE tu
      WHEN 'A' THEN 40
      WHEN 'B' THEN 30
      WHEN 'C' THEN 25
      WHEN 'D' THEN 20
      ELSE 15
    END;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

UPDATE "ms_fantasy_lineups" AS l
SET
  "pickTiers" = b.tiers,
  "pickSalaries" = b.sals
FROM (
  SELECT
    l2.id,
    array_agg(upper(trim(r."tier")) ORDER BY u.ord) AS tiers,
    array_agg(_ms_fantasy_salary_for_snapshot(r."tier", r."position") ORDER BY u.ord) AS sals
  FROM "ms_fantasy_lineups" l2
  CROSS JOIN LATERAL unnest(l2."pickIds") WITH ORDINALITY AS u(pid, ord)
  INNER JOIN "ms_fantasy_roster_players" r ON r.id = u.pid
  WHERE cardinality(l2."pickIds") = 6
  GROUP BY l2.id
  HAVING COUNT(*) = 6
) AS b
WHERE l.id = b.id
  AND COALESCE(cardinality(l."pickTiers"), 0) = 0;

DROP FUNCTION IF EXISTS _ms_fantasy_salary_for_snapshot(TEXT, TEXT);

-- Lucas Raymond → tier A (JSON repre už A; DB po starším importu může mít B). Odevzdané sestavy drží plat díky pickSalaries výše.
UPDATE "ms_fantasy_roster_players"
SET "tier" = 'A', "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'SWE26-F23-RAYMOND';
