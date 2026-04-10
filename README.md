# MS 2026 Sestavovač nominace

MVP aplikace pro hokejové fanoušky – sestav si svou nominaci na Mistrovství světa 2026.

## Tech stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + PostgreSQL (Railway)
- **html-to-image** pro generování plakátů

## Rychlý start

### 1. Databáze (Railway)

1. Vytvoř projekt na [Railway](https://railway.app)
2. Přidej PostgreSQL databázi
3. Zkopíruj connection string

### 2. Konfigurace

```bash
# Zkopíruj .env.example do .env
cp .env.example .env

# Nastav DATABASE_URL v .env (connection string z Railway)
```

### 3. Instalace a spuštění

```bash
npm install
npx prisma db push      # Vytvoří tabulky v DB
npm run db:seed         # Naplní ukázkové hráče
npm run dev             # Spustí dev server
```

Otevři [http://localhost:3000](http://localhost:3000)

## Pravidla sestavy

- **3 brankáři** (G)
- **7 obránců** (D)
- **15 útočníků** (F)
- **Celkem 25 hráčů**
- Jeden hráč může být označen jako **Kapitán** (C)

## Funkce

- Vizuální hokejové hřiště s dresy
- Seznam hráčů z databáze – kliknutím přidáš do sestavy
- Výběr kapitána – klikni na dres
- **Uložit a Sdílet** – uloží do DB a stáhne plakát (PNG)

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
5. Build command je v `package.json`: `prisma generate && prisma db push && next build`
6. Po prvním deployi spusť seed (jednou): v Railway dashboardu u Web Service → **Settings** → **Deploy** nebo přes CLI:
   ```bash
   railway link   # propoj s projektem
   railway run npm run db:seed
   ```

### 3. Hotovo
Aplikace poběží na URL typu `tvoje-app.up.railway.app`
