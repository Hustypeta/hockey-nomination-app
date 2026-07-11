-- Ponechat jen 4 kategorie z UI: soupiska, fantasy, obecné, Q&A.
-- Staré příspěvky v Memes / Off-topic převedeme na Obecné.

UPDATE "community_posts"
SET "category" = 'GENERAL'
WHERE "category" IN ('MEMES', 'OFF_TOPIC');

ALTER TYPE "CommunityPostCategory" RENAME TO "CommunityPostCategory_old";

CREATE TYPE "CommunityPostCategory" AS ENUM (
  'LINEUP_NOMINATION',
  'FANTASY',
  'GENERAL',
  'Q_AND_A'
);

ALTER TABLE "community_posts"
  ALTER COLUMN "category" TYPE "CommunityPostCategory"
  USING ("category"::text::"CommunityPostCategory");

DROP TYPE "CommunityPostCategory_old";
