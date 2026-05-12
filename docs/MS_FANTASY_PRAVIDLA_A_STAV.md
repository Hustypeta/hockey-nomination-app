# MS Fantasy 2026 — pravidla, body a stav

Jednotný přehled toho, co je v kódu **dohodnuté a vynucované**, a co je zatím jen **připravené** nebo **chybí**. Čísla a limity měň v `src/lib/msFantasyConfig.ts` (a případně v seedu / JSON soupiskách), aby zůstala jedna pravda.

---

## 1. Pravidla sestavy (den)

| Pravidlo | Hodnota | Kde |
|----------|---------|-----|
| Počet hráčů ve sestavě | **6** | `MS_FANTASY_TEAM_SIZE` |
| Brankářů | **přesně 1** (G), ostatní sloty F nebo D | `validateMsFantasyLineup` |
| Opakování hráčů | **zakázáno** (6 různých `id`) | validace + API duplicita |
| Salary cap (součet platů tierů) | **max. 144** | `MS_FANTASY_CAP` |
| Plat podle tieru | A **34**, B **28**, C **22**, D **16**, E **14** | `MS_FANTASY_TIER_SALARY` |
| Neznámý tier v datech | bere se jako cena **E** (`salaryForTier`) | `salaryForTier` |
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
- Uložení sestavy na uživatele + den (`MsFantasyLineup`, `salarySpent`, `pickIds`), uzávěrka podle `lockAt`.
- Načítání poolu (`/api/fantasy/roster`) a seznam dnů (`/api/fantasy/game-days`, `[slug]`).
- Import soupisek z JSON přes Prisma seed a proměnné `MS_FANTASY_SEED_*` (viz `prisma/seed.ts`).

---

## 4. Další fáze (nad základní produkt)

1. **Výsledky a body** — zdroj pravdy pro góly/asistence/+/− u vybraných hráčů za den; volání `lineupDayPoints` / skater+goalie funkce a uložení nebo agregace.
2. **Žebříček fantasy** — porovnání podle součtu bodů za den / turnaj (samostatná feature nad uloženými sestavami).
3. **Data** — po oficiálním zveřejnění IIHF doplnit soupisky (např. čísla dresů u SLO v JSON); znovu seedovat příslušné `MS_FANTASY_SEED_*`.

---

## 5. Rychlá reference souborů

| Oblast | Soubor |
|--------|--------|
| Cap, ceny tierů, konstanty bodů | `src/lib/msFantasyConfig.ts` |
| Validace 6 hráčů, 1 G, cap | `src/lib/msFantasyValidation.ts` |
| Výpočet bodů ze „boxu“ | `src/lib/msFantasyScoring.ts` |
| Uložení / lock | `src/app/api/fantasy/my-lineup/route.ts` |
| Modely DB | `prisma/schema.prisma` (`MsFantasyRosterPlayer`, `MsFantasyGameDay`, `MsFantasyLineup`) |

---

*Poslední srovnání s kódem: dokument popisuje stav repozitáře v době vytvoření souboru; po změnách v `msFantasyConfig` aktualizuj tabulky výše. Veřejná stránka s živými čísly z konfigurace: **`/fantasy/pravidla`**.*
