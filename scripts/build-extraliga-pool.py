#!/usr/bin/env python3
"""
Triple Arena — tier engine + výběr 54 hráčů + 18 trojic.

Použití:
  python scripts/build-extraliga-pool.py
  python scripts/export-extraliga-players-xlsx.py

Váhy a počty trojic: data/extraliga-tier-config.json
Výstup poolu: data/extraliga-pool-output.json
Tier sloupce se zapíší zpět do data/extraliga-player-stats.json
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

from extraliga_fantasy_common import (  # noqa: E402
    POOL_OUTPUT_JSON,
    load_stats,
    load_tier_config,
    merge_roster_with_stats,
    num,
    rate,
    save_stats,
)


def compute_score(player: dict[str, Any], cfg: dict[str, Any]) -> float | None:
    w = cfg["weights"]
    min_gp = int(cfg.get("min_gp_for_rate", 10))

    parts: list[tuple[float, float]] = []
    mapping = [
        ("season_2024_25_ppg", "body_2024_25", "gp_2024_25"),
        ("season_2025_26_ppg", "body_2025_26", "gp_2025_26"),
        ("season_2023_24_ppg", "body_2023_24", "gp_2023_24"),
        ("form_l10_ppg", "body_l10", "gp_l10"),
    ]
    for weight_key, body_key, gp_key in mapping:
        weight = float(w.get(weight_key, 0))
        if weight <= 0:
            continue
        r = rate(player.get(body_key), player.get(gp_key), min_gp if gp_key != "gp_l10" else 1)
        if r is not None:
            parts.append((weight, r))

    if not parts:
        return None

    total_w = sum(p[0] for p in parts)
    base = sum(p[0] * p[1] for p in parts) / total_w

    bonus = num(player.get("bonus_ppg"))
    if bonus is None:
        tag = str(player.get("bonus_tag") or "").strip().upper()
        pedigree = cfg.get("pedigree_bonus_ppg") or {}
        if tag and tag in pedigree:
            bonus = float(pedigree[tag])
    return base + (bonus or 0.0)


def assign_tiers(scored: list[dict[str, Any]], cfg: dict[str, Any]) -> None:
    """Přiřadí tier_pismeno (A/B/C) a tier_slot (1/2/3) v rámci fantasy pozice."""
    by_pos: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in scored:
        by_pos[row["fantasy_position"]].append(row)

    letters = cfg.get("tier_letters", ["A", "B", "C"])
    slots = cfg.get("tier_slots", [1, 2, 3])
    labels = cfg.get("tier_slot_labels", {})

    for fpos, group in by_pos.items():
        rated = [r for r in group if r.get("kvalita_skore") is not None]
        rated.sort(key=lambda r: r["kvalita_skore"], reverse=True)
        n = len(rated)
        if n == 0:
            continue

        for i, row in enumerate(rated):
            # Třetiny podle pořadí ve skupině pozice
            letter_idx = min(len(letters) - 1, (i * len(letters)) // n)
            slot_idx = min(len(slots) - 1, ((i % n) * len(slots)) // n)
            # Lepší rozložení slotů: rozdělit na 3 pásma podle ranku
            rank_ratio = i / max(n - 1, 1)
            if rank_ratio <= 0.33:
                slot = slots[0]
            elif rank_ratio <= 0.66:
                slot = slots[1]
            else:
                slot = slots[2]

            letter = letters[letter_idx]
            row["tier_pismeno"] = letter
            row["tier_slot"] = slot
            label_list = labels.get(letter, [])
            slot_label = label_list[slot - 1] if 1 <= slot <= len(label_list) else ""
            row["tier_label"] = f"{letter}{slot}" + (f" {slot_label}" if slot_label else "")


def pick_pool(scored: list[dict[str, Any]], cfg: dict[str, Any]) -> tuple[list[dict[str, Any]], list[str]]:
    """Vybere hráče do poolu podle pool_counts; WC = nejlepší zbylí bruslaři."""
    pool_counts: dict[str, int] = cfg["pool_counts"]
    warnings: list[str] = []

    with_score = [r for r in scored if r.get("kvalita_skore") is not None]
    without = [r for r in scored if r.get("kvalita_skore") is None]
    if without:
        warnings.append(f"{len(without)} hráčů bez statistik — do poolu nepůjdou.")

    selected: list[dict[str, Any]] = []
    used_ids: set[str] = set()

    for fpos in ["C", "LW", "RW", "D", "G"]:
        need = pool_counts.get(fpos, 0)
        candidates = sorted(
            [r for r in with_score if r["fantasy_position"] == fpos and r["player_id"] not in used_ids],
            key=lambda r: r["kvalita_skore"],
            reverse=True,
        )
        if len(candidates) < need:
            warnings.append(f"Pozice {fpos}: jen {len(candidates)} hráčů se statistikami (potřeba {need}).")
        picked = candidates[:need]
        for p in picked:
            p["v_poolu"] = "ano"
            p["pool_group"] = fpos
            used_ids.add(p["player_id"])
            selected.append(p)

    wc_need = pool_counts.get("WC", 0)
    wc_candidates = sorted(
        [
            r
            for r in with_score
            if r["fantasy_position"] in {"C", "LW", "RW", "D"}
            and r["player_id"] not in used_ids
        ],
        key=lambda r: r["kvalita_skore"],
        reverse=True,
    )
    if len(wc_candidates) < wc_need:
        warnings.append(f"WC: jen {len(wc_candidates)} náhradníků (potřeba {wc_need}).")
    for p in wc_candidates[:wc_need]:
        p["v_poolu"] = "ano"
        p["pool_group"] = "WC"
        used_ids.add(p["player_id"])
        selected.append(p)

    return selected, warnings


def build_triplets(pool: list[dict[str, Any]], cfg: dict[str, Any]) -> list[dict[str, Any]]:
    """Sestaví trojice — v každé jeden hráč z tier slotu 1, 2, 3 (co nejvíc)."""
    triplets_cfg: dict[str, int] = cfg["triplets_per_group"]
    triplets: list[dict[str, Any]] = []

    for group, count in triplets_cfg.items():
        players = [p for p in pool if p.get("pool_group") == group]
        players.sort(key=lambda r: r["kvalita_skore"], reverse=True)

        for t_idx in range(count):
            triplet_players: list[dict[str, Any]] = []
            used_clubs: set[str] = set()

            for slot in [1, 2, 3]:
                slot_candidates = [
                    p
                    for p in players
                    if p.get("tier_slot") == slot and p["player_id"] not in {x["player_id"] for x in triplet_players}
                ]
                slot_candidates.sort(
                    key=lambda r: (
                        r["club"] in used_clubs,
                        -r["kvalita_skore"],
                    )
                )
                if slot_candidates:
                    pick = slot_candidates[0]
                    triplet_players.append(pick)
                    used_clubs.add(pick["club"])
                elif players:
                    # fallback: kdokoliv volný
                    rest = [p for p in players if p["player_id"] not in {x["player_id"] for x in triplet_players}]
                    if rest:
                        triplet_players.append(rest[0])

            triplets.append(
                {
                    "id": f"{group}-{t_idx + 1}",
                    "group": group,
                    "index": t_idx + 1,
                    "players": [
                        {
                            "player_id": p["player_id"],
                            "name": p["name"],
                            "club": p["club"],
                            "tier_label": p.get("tier_label"),
                            "kvalita_skore": round(p["kvalita_skore"], 3),
                        }
                        for p in triplet_players
                    ],
                }
            )

    return triplets


def write_back_to_stats(all_rows: list[dict[str, Any]], pool_ids: set[str]) -> None:
    stats = load_stats()
    stat_source_keys = [
        "gp_2025_26",
        "body_2025_26",
        "gp_2024_25",
        "body_2024_25",
        "gp_2023_24",
        "body_2023_24",
        "gp_l10",
        "body_l10",
    ]
    tier_fields = [
        "kvalita_skore",
        "tier_pismeno",
        "tier_slot",
        "tier_label",
        "v_poolu",
    ]
    for row in all_rows:
        pid = row["player_id"]
        existing = stats.get(pid, {})
        has_stats = row.get("kvalita_skore") is not None or any(
            existing.get(k) not in (None, "") for k in stat_source_keys
        )
        if not has_stats:
            continue
        entry = stats.setdefault(pid, {})
        if row.get("display_name"):
            entry["display_name"] = row["display_name"]
        for key in tier_fields:
            if key == "v_poolu":
                entry[key] = "ano" if pid in pool_ids else "ne"
            elif key == "kvalita_skore" and row.get(key) is not None:
                entry[key] = round(float(row[key]), 3)
            elif row.get(key) not in (None, ""):
                entry[key] = row[key]
    save_stats(stats)


def main() -> None:
    cfg = load_tier_config()
    roster = merge_roster_with_stats()

    scored: list[dict[str, Any]] = []
    for row in roster:
        fpos = row.get("fantasy_position") or ""
        if not fpos:
            continue
        score = compute_score(row, cfg)
        enriched = {**row, "kvalita_skore": score}
        scored.append(enriched)

    assign_tiers(scored, cfg)
    pool, warnings = pick_pool(scored, cfg)
    pool_ids = {p["player_id"] for p in pool}
    triplets = build_triplets(pool, cfg)

    # Reset v_poolu u všech
    for row in scored:
        row["v_poolu"] = "ano" if row["player_id"] in pool_ids else "ne"

    write_back_to_stats(scored, pool_ids)

    output = {
        "generated_from": {
            "players_with_stats": len([r for r in scored if r.get("kvalita_skore") is not None]),
            "players_total": len(scored),
            "pool_size": len(pool),
            "triplet_count": len(triplets),
        },
        "warnings": warnings,
        "pool": [
            {
                "player_id": p["player_id"],
                "name": p["name"],
                "club": p["club"],
                "fantasy_position": p["fantasy_position"],
                "pool_group": p.get("pool_group"),
                "kvalita_skore": round(p["kvalita_skore"], 3),
                "tier_label": p.get("tier_label"),
            }
            for p in sorted(pool, key=lambda r: (r.get("pool_group", ""), -r["kvalita_skore"]))
        ],
        "triplets": triplets,
    }

    POOL_OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    POOL_OUTPUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Hráčů celkem: {len(scored)}")
    print(f"Se statistikami: {output['generated_from']['players_with_stats']}")
    print(f"Pool: {len(pool)} / 54 hráčů, {len(triplets)} trojic")
    if warnings:
        print("\nUpozornění:")
        for w in warnings:
            print(f"  - {w}")
    print(f"\nVýstup: {POOL_OUTPUT_JSON}")
    print("Tier sloupce -> data/extraliga-player-stats.json")
    print("Spusť pak: python scripts/export-extraliga-players-xlsx.py")


if __name__ == "__main__":
    main()
