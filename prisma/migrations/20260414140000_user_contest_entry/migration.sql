-- AlterTable
ALTER TABLE "users" ADD COLUMN "contestEntryNominationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_contestEntryNominationId_key" ON "users"("contestEntryNominationId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_contestEntryNominationId_fkey" FOREIGN KEY ("contestEntryNominationId") REFERENCES "nominations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Každému uživateli s nominacemi: nejstarší uložená nominace = dosavadní „účast“ ve statistikách a žebříčku
UPDATE "users" u
SET "contestEntryNominationId" = sub.id
FROM (
  SELECT DISTINCT ON ("userId") "userId", id
  FROM "nominations"
  WHERE "userId" IS NOT NULL
  ORDER BY "userId", "createdAt" ASC
) sub
WHERE u.id = sub."userId";
