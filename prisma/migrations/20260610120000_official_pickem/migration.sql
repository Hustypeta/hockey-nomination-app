-- Oficiální výsledky Pick'em pro admin vyhodnocení.
CREATE TABLE "official_pickem" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "official_pickem_pkey" PRIMARY KEY ("id")
);
