# Lineup — editor sestavy nominace (MS 2026)

MVP aplikace **Lineup** pro hokejové fanoušky – sestav si svou nominaci na Mistrovství světa 2026.

## Tech stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + PostgreSQL (Railway)
- **html-to-image** pro generování plakátů

## Rychlý start

### 1. Lokální databáze (doporučeno)

**Nepřipojuj lokální `npm run dev` na Railway Postgres**, pokud production ještě běží staré `main` s `prisma db push --accept-data-loss` — každý Railway restart může smazat `players.poolKey` uprostřed vývoje.

**Docker (preferováno):**

```bash
docker compose up -d
cp .env.local.example .env.local   # Windows: copy .env.local.example .env.local
# Doplň NEXTAUTH_* / OAuth do .env.local; DATABASE_URL už míří na localhost
npm install
npm run db:ensure && npm run import:lineup-pools
npm run dev
```

`DATABASE_URL` v příkladu: `postgresql://lineup:lineupdev@localhost:5432/lineup`. Railway URL si můžeš nechat zakomentovanou jako `DATABASE_URL_RAILWAY` — nepoužívej ji jako aktivní `DATABASE_URL` při lokálním vývoji.

**Bez Dockeru (Windows):** nainstaluj [PostgreSQL 17](https://www.postgresql.org/download/windows/), vytvoř roli/DB `lineup` / heslo `lineupdev` (nebo uprav `DATABASE_URL`), pak stejné `db:ensure` + `import:lineup-pools`.

**Když musíš dočasně používat Railway DB:** vypni Railway web service a vždy spouštěj přes `npm run dev` (predev → `db:ensure` znovu pushne schéma).

### 2. Instalace a spuštění (shrnutí)

```bash
npm install
npm run db:ensure               # prisma generate + db push + ověření players.poolKey (+ auto-import)
npm run import:lineup-pools     # A-tým + Extraliha pooly do `players` (když ensure nestačí)
npm run db:seed                 # Volitelně: starší seed kandidátů
npm run dev                     # automaticky spustí predev → db:ensure
```

Otevři [http://localhost:3000](http://localhost:3000)

### Lineup pooly (Excel → DB)

**Nech 2 Excel soubory odděleně** (národní A-tým + Extraliha kluby). **Neslučuj** je do jednoho souboru a **nemaz** je.

Workflow:

1. Uprav Excel(y)
2. `npm run import:lineup-pools` — export JSON z obou Excelů + upsert do `players` s `poolKey` (`repre_a` ≈ 171, `elh:<klub>` pro kluby)

Když editor ukáže „žádní hráči“, prázdné ELH pooly, nebo špatné počty:

```bash
npm run db:ensure && npm run import:lineup-pools
```

Častá příčina: po resetu Railway DB chybí sloupec `players.poolKey` (Prisma P2022) — `db:ensure` / `db:push` ho doplní. Production `npm start` volá `scripts/ensure-lineup-db.mjs` (`prisma db push` **bez** `--accept-data-loss` + ověření poolů + auto-import). Nikdy nepoužívej `prisma db push --accept-data-loss` — to umí shodit sloupce při driftu schématu.

## Pravidla sestavy

- **Základní sestava (20 + 2):** 20 bruslařů (13 útočníků v lajnách včetně 13. útočníka u 4. lajny, 7 obránců v párech + 7. bek) a **2 brankáři** — odpovídá typické „dresovací“ nominaci na zápas.
- **Náhradníci (3):** 3. brankář, náhradní útočník, 8. bek (náhradní obránce).
- **3 brankáři** (G), **8 obránců** (D), **14 útočníků** (F) — **celkem 25 hráčů** (soupiska MS)
- Jeden hráč může být označen jako **Kapitán** (C)

## Funkce

- Vizuální hokejové hřiště s dresy
- Seznam hráčů z databáze – kliknutím přidáš do sestavy
- Výběr kapitána – klikni na dres
- **Uložit a Sdílet** – otevře modal; uložení do účtu a stažení/sdílení PNG plakátu jsou samostatné kroky

## Hráči (seed)

Data z `czech-players-2025-26.json` – všichni čeští hráči z **Extraligy, NHL, AHL, SHL, Liiga, NL** (dle Elite Prospects). Vyřazeni: David Krejčí (důchodce), hráči z 2. ligy.

## Deployment na Railway

### 1. GitHub
1. Nahraj projekt na GitHub (pokud ještě není)
2. `git init` → `git add .` → `git commit -m "Initial"` → `git remote add origin ...` → `git push`

### 2. Railway
1. Jdi na [railway.app](https://railway.app) a přihlas se
2. **New Project** → **Deploy from GitHub repo** → vyber repozitář
3. Přidej **PostgreSQL**: v projektu klikni **+ New** → **Database** → **PostgreSQL**
4. Klikni na svůj **Web Service** (Next.js app) → **Variables** → Railway automaticky přidá `DATABASE_URL` z PostgreSQL (nebo ho propoj v **Settings** → **Variables** → **Add Reference** → vyber `DATABASE_URL` z PostgreSQL)
5. Build: `prisma generate && next build`. Start: `npm run start` → `ensure-lineup-db` (schema + pooly).
6. Po prvním deployi / prázdné DB: `railway run npm run import:lineup-pools` (ne `db:seed` — seed už nemaže lineup pooly).

### 3. Hotovo
Aplikace poběží na URL typu `tvoje-app.up.railway.app`
