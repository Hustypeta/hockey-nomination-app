# Contest scoring — first game lineup (operator notes)

Internal notes distilled from design discussion (2026). **Not** a replacement for published user-facing rules (`/pravidla` · `ContestRulesContent`). Use together with whatever is officially live.

## What the rules already say

- **Source of truth for positions:** the **official game lineup / lineup write-up (_zápis o utkání_) for Czechia’s **first match** — formations, D pairs, goalies — together with documents referenced in the contest rules (incl. the **official roster sheet** for that game where relevant).
- **Scoring bands (published logic):**
  - **+5:** same player, **same positional interpretation** as on that official matchup document.
  - **+2 (max one band per player with +5 cap overall):** player is on the **official roster for that match**, but your user picked a **different slot** → **same coarse group G / D / F** salvage, as described in the rules note.

Technical implementation maps user + official slots to string keys (`f0-lw`, `d3-lb`, `xd0`, …) in `scoreNominationAgainstOfficial` / `iterLineupSlots`; **admin transcription** determines whether keys match reality.

---

## User mental model (builder vs real game)

- Users think in **two layers:** **lines** (players who effectively “play tonight” / are in skating groups) vs **substitutes / tribune** (still on the nominace list, scratched or not in tonight’s formations).
- The **tournament nominace** in the editor is **25 players** (`14 F + 8 D + 3 G`). The **dress / game-roster constraint** discussed in Czech rules is narrower (e.g. **20 skaters** + goalies dressed for play). The federation can vary **forward vs defender count among those twenty** (e.g. **12 F + 8 D** vs **13 F + 7 D**) without violating published contest wording **as long as** scoring reads off the **official game document**, not anyone’s imaginary frame.

---

## Variable F/D split (e.g. 12 forwards + 8 defensemen among 20 dressed)

- Only **slots that exist on that official lineup** produce **exact** comparisons. Fewer dressed forwards ⇒ fewer forward **coordinates** that can earn **+5** via perfect match.
- Participants can still earn **category** salvage where rules allow (**+2**). Anyone they roster who is **absent from the official roster you chose for “that match”** gets **no** defender/forward recognition from that tier.

---

## Defensemen 7 and 8 — mapping to our editor keys

There is **no** intrinsic IIHF numbering for “who is seventh vs eighth.” Operators must transcribe consistently.

### Seventh defenseman (“last row bek” slot)

- In this product’s nomination layout after normalization:
  - **7th defender** = **fourth pair, LEFT (`d3-lb`)**.
- **Convention adopted in discussion:** Align with **left defenseman of the printed fourth pair** when the federation lists **four defence pairs**.

### Eighth defender (substitute bek slot)

- In this product:
  - **8th defender** = **`xd0`** (extra / substitute defender slot — `extraDefensemen[0]` in `LineupStructure`).
- Often corresponds to **right defender of the printed fourth pair** transcribed into the nominal “substitute bek” bucket (after `normalizeLineupStructure` in nomination mode).

### Operational decision (discussion, “solve on roster day” where needed)

- **7th (LB / `d3-lb`):** full **positional** scoring apples-to-apples if admin keys match sheet.
- **8th (`xd0`):** Treat **positional exactness as unsettled ahead of roster drop** → plan to **finalize when the roster is visible**. Default intent articulated in chat: **`xd0`** should emphasize **having the correct person on the nominace roster for that defender**, not insisting on **`+5` “exact slot” prestige** comparable to skating pairs — i.e. lean on **`+2` “right name / D group vs wrong lineup slot”** unless you later consciously grant exact key match because the federation labels that scratch spot unambiguously.

Revisit this paragraph **after first-game documents publish** so operations, communication, and (if necessary) scoring tweaks agree.

---

## Practical checklist before publishing scores

1. Import **faithful** admin keys from **game sheet**.
2. If **twelve forwards** dressed, acknowledge **fewer official forward anchors** ⇒ expect lower **exact-match** totals **without changing rules wording**.
3. Publish a **short transparency note**: how sheet rows mapped to **`d3-lb`**, **`xd0`**, etc., if social heat appears.

---

## Files / code refs (implementers)

- User-facing methodology: `src/components/ContestRulesContent.tsx`
- Lineup completeness (25-slot editor): `src/lib/lineupUtils.ts` · `isLineupComplete`
- Scoring harness: `src/lib/contestScoring.ts`

---

_Last updated from internal conversation snapshot — adjust “8th defender” grading policy explicitly once official MS materials are locked._
