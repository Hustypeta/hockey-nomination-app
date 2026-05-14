# MS Fantasy 2026 — pravidla, body a stav

Jednotný přehled toho, co je v kódu **dohodnuté a vynucované**, a co je zatím jen **připravené** nebo **chybí**. Čísla a limity měň v `src/lib/msFantasyConfig.ts` (a případně v seedu / JSON soupiskách), aby zůstala jedna pravda.

---

## 1. Pravidla sestavy (den)

| Pravidlo | Hodnota | Kde |
|----------|---------|-----|
| Počet hráčů ve sestavě | **6** | `MS_FANTASY_TEAM_SIZE` |
| Brankářů | **přesně 1** (G), ostatní sloty F nebo D | `validateMsFantasyLineup` |
| Opakování hráčů | **zakázáno** (6 různých `id`) | validace + API duplicita |
| Salary cap (součet platů tierů) | **max. 165** | `MS_FANTASY_CAP` |
| Plat podle tieru — bruslaři (F/D) | A **40**, B **30**, C **25**, D **20**, E **15** | `MS_FANTASY_TIER_SALARY_SKATER` |
| Plat podle tieru — brankáři (G) | A **45**, B **35**, C **28**, D **22**, E **18** | `MS_FANTASY_TIER_SALARY_GOALIE` |
| Neznámý tier v datech | bere se jako cena **E** podle pozice (`salaryForTier`) | `salaryForTier` |
| Uzávěrka dne | po `lockAt` nelze POST změnit sestavu (403) | `api/fantasy/my-lineup` |
| Aktivní hráči | jen `active: true` v DB | `my-lineup` POST |
| Viditelnost celé sekce | env `NEXT_PUBLIC_MS_FANTASY_VISIBLE` ≠ `false`/`0`/… | `isMsFantasyVisibleToUsers` |

**Poznámka k datům:** V poolu jsou tiery **A–E** podle soupisek v `data/*-ms2026-fantasy-roster.json`. U týmů **DEN, ITA, SLO** jsou v datech záměrně jen tiery **C, D, E** (žádný B). Švýcarsko má výjimku s tierem A (viz seed / JSON).

---

## 2. Bodování za zápas (pravidla v kódu; napojení na zápasy volitelné)

Pravidla bodů jsou definovaná v `src/lib/msFantasyConfig.ts` (`MS_FANTASY_POINTS`) a počítá je `src/lib/msFantasyScoring.ts`. Samotná fantasy **sestava + DB + UI** nezávisí na tom, jestli už běží automatické vyhodnocení — to je další krok.

### Bruslař (útočník nebo obránce ve fantasy sestavě)

| Stat | Body za jednotku |
|------|------------------|
| Gól | **+4** |
| Asistence | **+2** |
| Plus/mínus | **+1** za každý +/- bod |

*(Střely a hity v aktuálním zadání nejsou.)*

### Brankář

| Stat | Body za jednotku |
|------|------------------|
| Výhra | **+3** |
| Inkasovaný gól | **−1** |
| Shutout | **+3** |

**Důležité:** Funkce z `msFantasyScoring.ts` zatím **nejsou** volané z veřejného API ani z UI žebříčku — jde o připravenou logiku pro napojení na box score / admin zadání, až bude potřeba den vyhodnotit.

---

## 3. Co už v produktu funguje (UI + databáze + API)

- Přehled hracích dnů a editor sestavy (`/fantasy`, `/fantasy/[slug]`).
- Stránka pravidel a bodů pro hráče: **`/fantasy/pravidla`**.
- Salary cap a kontrola 1× G v UI i na serveru (`validateMsFantasyLineup`, POST `my-lineup`).
- Uložení sestavy na uživatele + den (`MsFantasyLineup`, `salarySpent`, `pickIds`), uzávěrka podle `lockAt` (= začátek prvního zápasu dne z pole `matches`, viz níže).
- Načítání poolu (`/api/fantasy/roster`) a seznam dnů (`/api/fantasy/game-days`, `[slug]`) včetně programu zápasů (`matches` JSON na `MsFantasyGameDay`).
- Import soupisek a hracích dnů přes Prisma seed: **`MS_FANTASY_SEED_FANTASY_DATA=true`** načte **17 hracích dnů + program zápasů** z `src/lib/ms2026FantasyOfficialGameDays.ts` (uzávěrky odvozené od prvního buly nebo explicitně u pauz) + všechny soupisky z manifestu v `prisma/seed.ts` (smaže existující fantasy dny včetně odevzdaných sestav a celý pool). Soubor `data/ms2026-fantasy-game-days.json` slouží jen jako rychlý přehled slugů a uzávěrek mimo seed. Jednotlivé týmy lze dál seedovat env `MS_FANTASY_SEED_AUT` apod.; `MS_FANTASY_SEED_SAMPLE` jen doplní dva ukázkové hrací dny, pokud v DB žádné nejsou (ne fantasy pool — ten je jen z JSON repre; při seedu se mažou záznamy `SAMPLE-*`).

---

## 4. Další fáze (nad základní produkt)

1. **Výsledky a body** — zdroj pravdy pro góly/asistence/+/− u vybraných hráčů za den; volání `lineupDayPoints` / skater+goalie funkce a uložení nebo agregace.
2. **Žebříček fantasy** — porovnání podle součtu bodů za den / turnaj (samostatná feature nad uloženými sestavami).
3. **Data** — fantasy JSON pro Česko je v `data/czechia-ms2026-fantasy-roster.json`; chybí ještě **Finsko a Německo** (`finland-ms2026-fantasy-roster.json`, `germany-ms2026-fantasy-roster.json` v `data/`). Úpravy programu MS / uzávěrek: `src/lib/ms2026FantasyOfficialGameDays.ts` (+ případně synchronně `data/ms2026-fantasy-game-days.json`); znovu spustit seed s `MS_FANTASY_SEED_FANTASY_DATA=true`.

---

## 5. Rychlá reference souborů

| Oblast | Soubor |
|--------|--------|
| Cap, ceny tierů, konstanty bodů | `src/lib/msFantasyConfig.ts` |
| Validace 6 hráčů, 1 G, cap | `src/lib/msFantasyValidation.ts` |
| Výpočet bodů ze „boxu“ | `src/lib/msFantasyScoring.ts` |
| Uložení / lock | `src/app/api/fantasy/my-lineup/route.ts` |
| Hrací dny MS (fantasy) + program zápasů | `src/lib/ms2026FantasyOfficialGameDays.ts` (přehled lockAt: `data/ms2026-fantasy-game-days.json`) |
| Manifest fantasy soupisek v seedu | `prisma/seed.ts` (`FANTASY_ROSTER_FILES`, `MS_FANTASY_SEED_FANTASY_DATA`) |

---

*Poslední srovnání s kódem: dokument popisuje stav repozitáře v době vytvoření souboru; po změnách v `msFantasyConfig` aktualizuj tabulky výše. Veřejná stránka s živými čísly z konfigurace: **`/fantasy/pravidla`**.*
