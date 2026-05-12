-- CreateTable
CREATE TABLE "ms_fantasy_roster_players" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ms_fantasy_roster_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ms_fantasy_game_days" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lockAt" TIMESTAMP(3) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ms_fantasy_game_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ms_fantasy_lineups" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameDayId" TEXT NOT NULL,
    "pickIds" TEXT[],
    "salarySpent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ms_fantasy_lineups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ms_fantasy_roster_players_code_key" ON "ms_fantasy_roster_players"("code");

-- CreateIndex
CREATE INDEX "ms_fantasy_roster_players_position_idx" ON "ms_fantasy_roster_players"("position");

-- CreateIndex
CREATE INDEX "ms_fantasy_roster_players_active_idx" ON "ms_fantasy_roster_players"("active");

-- CreateIndex
CREATE UNIQUE INDEX "ms_fantasy_game_days_slug_key" ON "ms_fantasy_game_days"("slug");

-- CreateIndex
CREATE INDEX "ms_fantasy_game_days_lockAt_idx" ON "ms_fantasy_game_days"("lockAt");

-- CreateIndex
CREATE INDEX "ms_fantasy_lineups_gameDayId_idx" ON "ms_fantasy_lineups"("gameDayId");

-- CreateIndex
CREATE UNIQUE INDEX "ms_fantasy_lineups_userId_gameDayId_key" ON "ms_fantasy_lineups"("userId", "gameDayId");

-- AddForeignKey
ALTER TABLE "ms_fantasy_lineups" ADD CONSTRAINT "ms_fantasy_lineups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ms_fantasy_lineups" ADD CONSTRAINT "ms_fantasy_lineups_gameDayId_fkey" FOREIGN KEY ("gameDayId") REFERENCES "ms_fantasy_game_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
