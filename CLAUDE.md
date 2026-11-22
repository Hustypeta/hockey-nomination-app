# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Lineup** (hokejlineup.cz) — a Czech-language fan site for ice hockey: a lineup/nomination editor for the Czech national team (and Extraliga clubs), shareable PNG posters, contests (nomination scoring, bracket pick'em, MS fantasy), a community forum and news. UI text, comments, docs and many commit messages are in Czech; keep new user-facing copy in Czech and watch for UTF-8 corruption of diacritics (there has been a fix-up commit for that).

Stack: Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS 4, Prisma 6 + PostgreSQL (via `@prisma/adapter-pg` driver adapter), NextAuth v4 (Google OAuth, Prisma adapter), `html-to-image` for posters, `@dnd-kit` for drag-and-drop. Deployed on Railway (Nixpacks, Node 20). Path alias `@/*` → `src/*`.

## Commands

```bash
docker compose up -d                 # local Postgres 17 (lineup / lineupdev @ localhost:5432/lineup)
cp .env.local.example .env.local     # .env.local overrides .env everywhere (prisma.config.ts, scripts)
npm install                          # postinstall runs prisma generate
npm run db:ensure && npm run import:lineup-pools
npm run dev                          # predev runs db:ensure first; serves :3000
npm run dev:clean                    # same, after wiping .next/dev
npm run build                        # prisma generate && next build
npm run lint                         # eslint (scripts/** is ignored)
npx tsc --noEmit                     # type check (no dedicated script)
```

There is **no test suite**. Verification is lint + type check + build, plus running the app. One-off ts-node scripts in `scripts/` (e.g. `scripts/verify-contest-scoring.ts`, `preview-*.ts`) serve as ad-hoc checks; run them as the `package.json` entries do: `npx ts-node -r tsconfig-paths/register --project scripts/tsconfig.json scripts/<file>.ts`.

Prisma CLI commands that need the DB should go through `node scripts/prisma-with-env.mjs <args>` (`npm run db:push`, `db:migrate:deploy`) so `.env.local` is loaded.

## Database rules (important)

- **Never run `prisma db push --accept-data-loss`.** Schema drift has wiped `players.poolKey` before. `scripts/ensure-lineup-db.mjs` (run by `predev`, `db:ensure` and production `npm start`) does a safe `db push`, verifies `Player.poolKey`, and auto-runs the pool import if pools look collapsed/empty.
- Develop against local Postgres, not the Railway production DB. `db:ensure` warns when `DATABASE_URL` points at Railway.
- The schema is maintained mostly via `db push`; `prisma/migrations/` exists but is not the only source of truth. Edit `prisma/schema.prisma`, then `npm run db:ensure`.
- `src/lib/prisma.ts` exports a lazy Proxy singleton backed by a `pg` Pool (`PG_POOL_MAX`, default 5). Import `prisma` from `@/lib/prisma`; don't construct new clients.

## Player pools (Excel → JSON → DB)

Players live in the `players` table keyed by `poolKey`: `repre_a` / `repre_u20` / `repre_u18` / `repre_zeny` for national teams and `elh:<club name>` for Extraliga clubs (see `src/lib/lineupPools.ts`; club names must match exactly). Source of truth is two separate Excel files, `data/czech-national-players.xlsx` and `data/extraliga-fantasy-players.xlsx` — keep them separate, never merge or delete them. `npm run import:lineup-pools` runs `scripts/export-lineup-pools-json.py` (Python, shared helpers in `scripts/lineup_pools_common.py`) then upserts via `scripts/import-lineup-pools.ts`. The many `scrape:*` / `enrich:*` / `fantasy:*` npm scripts are Python/ts-node data-maintenance tools for these files and the MS fantasy rosters in `data/*.json`.

## Architecture

- **Lineup model** — `LineupStructure` in `src/types/index.ts`: 4 forward lines (`lw/c/rw/x`, `x` = 13th forward on line 4), 4 defense pairs (4th pair `lb` = 7th D), 3 goalies, `extraForwards`, `extraDefensemen` (8th D), captain/assistants, optional 2×5 power play. A full roster is 25 (14 F / 8 D / 3 G); "20+2" are dressed, 3 are substitutes. Slot string keys like `f0-lw`, `d3-lb`, `xd0` are used for DnD ids (`dndSlotIds.ts`) and contest scoring (`contestScoring.ts`, `iterLineupSlots`); keep them stable because stored lineups and scoring depend on them.
- **Editor** — canonical URL `/editorsestavy` (match lineup builder in `src/components/match/`, pool switching via `LineupPoolSwitcher`). Old routes (`/sestava`, `/zapasy`, `/fantasy`, `/hraci`, `/v/*`, …) are permanent redirects in `next.config.ts`; check there before reviving or adding routes.
- **Sharing** — saved lineups become `MatchShareLink` (viewed at `/m/[slug]`), bracket pick'em `ShareLink` at `/p/[code]`. Posters are rendered as hidden React components and captured client-side with `html-to-image` (`src/lib/captureSharePoster.ts`, `posterAssetCache.ts` inlines images as data URLs, `sharePosterLayout.ts` holds pixel sizes). Poster components are in `src/components/match/*Poster*` and `src/components/*SharePoster.tsx`.
- **UI shell** — the "FIFA" design (`src/components/fifa/`, `src/app/fifa-design-system.css`) is the live public UI; `NEXT_PUBLIC_FIFA_DESIGN=false` is a kill switch (`src/lib/fifa/fifaDesignEnabled.ts`). Shared chrome is in `src/components/site/`.
- **Middleware** (`src/middleware.ts`) — `/design`, `/promo`, `/cover`, `/jersey-preview` are work-preview pages that return 404 unless the host is localhost. It also passes `x-callback-path` for `/forum` and `/souteze` so sign-in returns to the right page.
- **Admin** — no public admin routes. Pages are `/admin/[accessKey]/…` and `/admin/<area>/[accessKey]`, gated by `CONTEST_ADMIN_ACCESS_KEY` (`notFound()` otherwise). Admin API routes use an HMAC-signed `contest_admin` cookie (`src/lib/adminSession.ts`, needs `CONTEST_ADMIN_SECRET` ≥16 chars + `CONTEST_ADMIN_PASSWORD`).
- **Contests** — nomination scoring against the official first-match lineup (`contestScoring.ts`, `contestLeaderboard.ts`, `contestTimeBonus.ts`; operator notes in `docs/README-contest-scoring-notes.md`), bracket pick'em (`pickem*.ts`), MS fantasy (`msFantasy*.ts`; rules and numbers in `docs/MS_FANTASY_PRAVIDLA_A_STAV.md`, constants in `msFantasyConfig.ts`). Several of these are toggled by env flags documented in `.env.example` (`NEXT_PUBLIC_MS_FANTASY_*`, `CONTEST_LEADERBOARD_*`).
- **Community** — forum posts/comments/likes/tags/attachments and player albums (`Community*`, `PlayerAlbum*` models; `src/lib/community/`, `src/components/forum/`, `src/components/komunita/`).
- **Email** — Resend-based broadcasts and results emails (`src/lib/emails/`, `scripts/send-*.ts`, `/api/admin/email/…`).
- API routes live under `src/app/api/**/route.ts`; most business logic is in flat modules in `src/lib/`.

## Branches and deploy

`main` is production and deploys to Railway on push (`npm run start` → `ensure-lineup-db` → `next start`). Canonical host is `hokejlineup.cz` (www redirects to apex). `docs/branches.md` mentions a `feature/fifa-redesign` branch, but the FIFA UI is already live on `main`.
