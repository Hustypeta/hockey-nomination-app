#!/usr/bin/env python3
"""
Scraper Tipsport extraligy z Hokej.cz (veřejné HTML tabulky).

Co umí:
  1) sezonní statistiky hráčů (GP/G/A/P) — stats-center, stránkování
  2) zápasy hráče + L10 forma — /hrac/.../match
  3) seznam zápasů posbíraný z game-logů (ID + skóre + kolo)
  4) zápis do data/extraliga-player-stats.json + volitelný export XLSX

Použití:
  python scripts/scrape-elh-hokej.py --seasons 2025,2024,2023,2022
  python scripts/scrape-elh-hokej.py --seasons 2025 --with-l10 --export-xlsx
  python scripts/scrape-elh-hokej.py --seasons 2025 --dry-run

Poznámka: není oficiální API. Hokej.cz může změnit HTML. Skript je šetrný
(pauzy mezi requesty) a jen pro osobní / prototypové použití.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

sys.path.insert(0, str(Path(__file__).resolve().parent))

from elh_scrape_common import (  # noqa: E402
    extract_options,
    fetch_text,
    normalize_club,
    normalize_name,
    parse_tables,
    parse_tables_with_hrefs,
    player_path_from_href,
    season_key,
    to_int,
)
from extraliga_fantasy_common import (  # noqa: E402
    STATS_JSON,
    load_roster,
    load_stats,
    save_stats,
    stable_player_id,
)

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "elh-scrape"
PLAYERS_RAW = RAW_DIR / "players-by-season.json"
MATCHES_RAW = RAW_DIR / "matches.json"
REPORT_RAW = RAW_DIR / "last-run-report.json"

BASE = "https://www.hokej.cz"
STATS_URL = f"{BASE}/tipsport-extraliga/stats-center"
SLEEP_S = 0.35


def sleep() -> None:
    time.sleep(SLEEP_S)


def discover_competitions(season: int) -> dict[str, int]:
    """Vrátí mapu label→competitionId pro danou sezonu ze stats-center."""
    html = fetch_text(f"{STATS_URL}?season={season}")
    sleep()
    options = extract_options(html)
    out: dict[str, int] = {}
    for val, label in options:
        if not val.isdigit():
            continue
        low = label.lower()
        if "tipsport extraliga" == low or low.startswith("tipsport extraliga"):
            if "play" in low:
                out["playoff"] = int(val)
            elif "bar" in low:
                out["baraz"] = int(val)
            else:
                out.setdefault("regular", int(val))
        elif "play off" in low and "tipsport" in low:
            out["playoff"] = int(val)
        elif "bar" in low and "extralig" in low:
            out["baraz"] = int(val)
    # fallback known IDs for 2025/26 if discovery fails
    if season == 2025:
        out.setdefault("regular", 7397)
        out.setdefault("playoff", 7537)
    return out


def find_stats_table(tables: list[list[list[str]]]) -> list[list[str]] | None:
    best = None
    for table in tables:
        if not table or len(table[0]) < 8:
            continue
        header = [c.lower() for c in table[0]]
        if "gp" in header and "g" in header and "a" in header:
            if best is None or len(table) > len(best):
                best = table
    return best


def scrape_stats_pages(season: int, competition: int) -> list[dict[str, Any]]:
    """Stáhne všechny stránky stats-center pro soutěž."""
    players: list[dict[str, Any]] = []
    seen_paths: set[str] = set()
    first_sig: str | None = None

    for page in range(1, 40):
        url = (
            f"{STATS_URL}?season={season}&competition={competition}"
            f"&stranger=0&stats-page={page}"
        )
        html = fetch_text(url)
        sleep()
        tables, hrefs_list = parse_tables_with_hrefs(html)
        table = find_stats_table(tables)
        if not table or len(table) <= 1:
            break

        # map header
        header = [c.strip().upper() for c in table[0]]
        idx = {name: i for i, name in enumerate(header)}
        # find matching href table index
        hrefs: list[str | None] = []
        for i, t in enumerate(tables):
            if t is table and i < len(hrefs_list):
                hrefs = hrefs_list[i]
                break

        sig = "|".join(r[1] if len(r) > 1 else "" for r in table[1:4])
        if page == 1:
            first_sig = sig
        elif sig == first_sig:
            break

        name_i = next((i for i, h in enumerate(header) if "JM" in h and "NO" in h), 1)
        team_i = next((i for i, h in enumerate(header) if "T" in h and "M" in h and i != name_i), 2)
        pos_i = next((i for i, h in enumerate(header) if h.startswith("POZ")), 3)

        for row_i, row in enumerate(table[1:], start=1):
            name = row[name_i] if len(row) > name_i else ""
            team = row[team_i] if len(row) > team_i else ""
            pos = row[pos_i] if len(row) > pos_i else ""
            gp = to_int(row[idx["GP"]]) if "GP" in idx and idx["GP"] < len(row) else None
            g = to_int(row[idx["G"]]) if "G" in idx and idx["G"] < len(row) else None
            a = to_int(row[idx["A"]]) if "A" in idx and idx["A"] < len(row) else None
            p = to_int(row[idx["P"]]) if "P" in idx and idx["P"] < len(row) else None
            if p is None and g is not None and a is not None:
                p = g + a
            href = hrefs[row_i] if row_i < len(hrefs) else None
            path = player_path_from_href(href)
            if path and path in seen_paths:
                continue
            if path:
                seen_paths.add(path)
            players.append(
                {
                    "name": name,
                    "team": team,
                    "position": pos,
                    "gp": gp,
                    "g": g,
                    "a": a,
                    "p": p,
                    "player_path": path,
                    "player_url": urljoin(BASE, path) if path else None,
                    "season": season,
                    "competition": competition,
                    "source_page": page,
                }
            )

        # last short page
        if len(table) - 1 < 30:
            break

    return players


def scrape_player_matches(
    player_path: str,
    season: int,
    competition: int | None = None,
) -> list[dict[str, Any]]:
    """Game-log hráče. Bez competition = všechny soutěže v sezoně."""
    url = f"{BASE}{player_path}/match?season={season}"
    if competition is not None:
        url += f"&competition={competition}"
    html = fetch_text(url)
    sleep()
    tables = parse_tables(html)
    game_table = None
    for table in tables:
        if table and len(table[0]) >= 8 and "datum" in table[0][0].lower():
            game_table = table
            break
    if not game_table:
        return []

    match_ids = re.findall(r"/zapas/(\d+)", html)
    rows: list[dict[str, Any]] = []
    for i, row in enumerate(game_table[1:]):
        if len(row) < 8:
            continue
        mid = match_ids[i] if i < len(match_ids) else None
        rows.append(
            {
                "date": row[0],
                "round": row[1],
                "competition": row[2],
                "matchup": row[3],
                "score": row[4],
                "g": to_int(row[5]),
                "a": to_int(row[6]),
                "p": to_int(row[7]),
                "plus_minus": to_int(row[8]) if len(row) > 8 else None,
                "pim": to_int(row[9]) if len(row) > 9 else None,
                "toi": row[10] if len(row) > 10 else None,
                "match_id": mid,
                "match_url": f"{BASE}/zapas/{mid}" if mid else None,
            }
        )
    return rows


def compute_l10(games: list[dict[str, Any]]) -> dict[str, int]:
    """Posledních 10 zápasů Tipsport extraligy (+ play-off ELH)."""
    elh = [
        g
        for g in games
        if "tipsport" in (g.get("competition") or "").lower()
        or "extralig" in (g.get("competition") or "").lower()
    ]
    # games are newest-first on Hokej.cz
    last = elh[:10]
    return {
        "gp_l10": len(last),
        "g_l10": sum(g.get("g") or 0 for g in last),
        "a_l10": sum(g.get("a") or 0 for g in last),
        "body_l10": sum(g.get("p") or 0 for g in last),
    }


def index_roster() -> list[dict[str, Any]]:
    rows = []
    for p in load_roster():
        name = p.get("name", "")
        club = p.get("club", "")
        position = p.get("position", "")
        role = (p.get("role") or "").strip()
        role_key = role or position
        rows.append(
            {
                "player_id": stable_player_id(name, club, role_key),
                "name": name,
                "club": club,
                "position": position,
                "role": role,
                "name_key": normalize_name(name),
                "club_key": normalize_club(club),
            }
        )
    return rows


def match_scraped_to_roster(
    scraped: dict[str, Any],
    roster: list[dict[str, Any]],
    used: set[str],
) -> dict[str, Any] | None:
    name_key = normalize_name(scraped.get("name") or "")
    club_key = normalize_club(scraped.get("team") or "")
    candidates = [r for r in roster if r["name_key"] == name_key and r["player_id"] not in used]
    if not candidates:
        # try last-name only
        last = name_key.split()[-1] if name_key else ""
        candidates = [
            r
            for r in roster
            if r["player_id"] not in used and r["name_key"].split()[-1] == last and last
        ]
    if not candidates:
        # containment: "samuel hunter fejes" vs "hunter fejes"
        candidates = [
            r
            for r in roster
            if r["player_id"] not in used
            and (
                name_key in r["name_key"]
                or r["name_key"] in name_key
                or (
                    len(name_key.split()) >= 2
                    and len(r["name_key"].split()) >= 2
                    and name_key.split()[0] == r["name_key"].split()[0]
                    and name_key.split()[-1] == r["name_key"].split()[-1]
                )
            )
        ]
    if not candidates:
        return None
    if len(candidates) == 1:
        return candidates[0]
    # prefer same club
    same_club = [
        c
        for c in candidates
        if c["club_key"] == club_key or club_key in c["club_key"] or c["club_key"] in club_key
    ]
    if same_club:
        return same_club[0]
    return candidates[0]


def merge_into_stats(
    stats: dict[str, dict[str, Any]],
    roster_row: dict[str, Any],
    season_stats: dict[int, dict[str, Any]],
    l10: dict[str, int] | None,
    player_meta: dict[str, Any],
) -> None:
    pid = roster_row["player_id"]
    overlay = stats.setdefault(pid, {})
    overlay.setdefault("display_name", player_meta.get("name") or roster_row["name"])
    if player_meta.get("player_url"):
        overlay["hokej_url"] = player_meta["player_url"]
    if player_meta.get("player_path"):
        overlay["hokej_path"] = player_meta["player_path"]

    for season, vals in season_stats.items():
        sk = season_key(season)
        if vals.get("gp") is not None:
            overlay[f"gp_{sk}"] = vals["gp"]
        if vals.get("g") is not None:
            overlay[f"g_{sk}"] = vals["g"]
        if vals.get("a") is not None:
            overlay[f"a_{sk}"] = vals["a"]
        if vals.get("p") is not None:
            overlay[f"body_{sk}"] = vals["p"]

    if l10:
        overlay.update(l10)

    overlay["scraped_at"] = datetime.now(timezone.utc).isoformat()


def collect_matches_from_games(all_games: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_id: dict[str, dict[str, Any]] = {}
    for g in all_games:
        mid = g.get("match_id")
        if not mid:
            # synthesize key from date+matchup+score
            mid = f"synth:{g.get('date')}|{g.get('matchup')}|{g.get('score')}"
        if mid in by_id:
            continue
        by_id[mid] = {
            "match_id": g.get("match_id"),
            "date": g.get("date"),
            "round": g.get("round"),
            "competition": g.get("competition"),
            "matchup": g.get("matchup"),
            "score": g.get("score"),
            "match_url": g.get("match_url"),
        }
    # sort by date descending when parseable
    def sort_key(m: dict[str, Any]) -> tuple:
        d = m.get("date") or ""
        parts = d.split(".")
        if len(parts) == 3 and all(p.isdigit() for p in parts):
            return (int(parts[2]), int(parts[1]), int(parts[0]))
        return (0, 0, 0)

    return sorted(by_id.values(), key=sort_key, reverse=True)


def run(args: argparse.Namespace) -> int:
    seasons = [int(x.strip()) for x in args.seasons.split(",") if x.strip()]
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    print("Discovering competitions…")
    comps_by_season: dict[int, dict[str, int]] = {}
    for season in seasons:
        comps = discover_competitions(season)
        comps_by_season[season] = comps
        print(f"  season {season}: {comps}")

    # 1) season player tables
    scraped_by_season: dict[str, list[dict[str, Any]]] = {}
    for season in seasons:
        regular_id = comps_by_season[season].get("regular")
        if not regular_id:
            print(f"  WARN: no regular competition for {season}, skip")
            continue
        print(f"Scraping player stats {season} competition={regular_id}…")
        players = scrape_stats_pages(season, regular_id)
        scraped_by_season[str(season)] = players
        print(f"  -> {len(players)} players")

        if args.include_playoff:
            po = comps_by_season[season].get("playoff")
            if po:
                print(f"Scraping playoff stats {season} competition={po}…")
                po_players = scrape_stats_pages(season, po)
                scraped_by_season[f"{season}_playoff"] = po_players
                print(f"  -> {len(po_players)} players")

    PLAYERS_RAW.write_text(
        json.dumps(scraped_by_season, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    roster = index_roster()
    stats = load_stats()
    used_ids: set[str] = set()
    unmatched: list[str] = []
    matched = 0

    # Index scraped players by path / name for L10
    primary_season = max(seasons)
    primary_players = scraped_by_season.get(str(primary_season), [])

    # Build per-roster season maps
    # First pass: match scraped primary season to roster
    matched_meta: dict[str, dict[str, Any]] = {}  # player_id -> scraped meta
    for scraped in primary_players:
        row = match_scraped_to_roster(scraped, roster, used_ids)
        if not row:
            unmatched.append(f"{scraped.get('name')} ({scraped.get('team')})")
            continue
        used_ids.add(row["player_id"])
        matched_meta[row["player_id"]] = scraped
        matched += 1

    print(f"Matched roster players for {primary_season}: {matched}/{len(roster)}")
    print(f"Unmatched scraped names: {len(unmatched)}")

    # Merge season stats from all seasons into matched players
    # Also try to attach older seasons via name/path
    path_to_pid = {
        meta["player_path"]: pid
        for pid, meta in matched_meta.items()
        if meta.get("player_path")
    }
    name_club_to_pid = {
        (normalize_name(meta["name"]), normalize_club(meta["team"])): pid
        for pid, meta in matched_meta.items()
    }

    season_values: dict[str, dict[int, dict[str, Any]]] = defaultdict(dict)
    for season_key_raw, players in scraped_by_season.items():
        if "_playoff" in season_key_raw:
            continue
        season = int(season_key_raw)
        for scraped in players:
            pid = None
            path = scraped.get("player_path")
            if path and path in path_to_pid:
                pid = path_to_pid[path]
            else:
                pid = name_club_to_pid.get(
                    (normalize_name(scraped.get("name") or ""), normalize_club(scraped.get("team") or ""))
                )
            if not pid:
                # try match against roster again for this season only
                row = match_scraped_to_roster(scraped, roster, set())
                if row and row["player_id"] in matched_meta:
                    pid = row["player_id"]
            if not pid:
                continue
            season_values[pid][season] = {
                "gp": scraped.get("gp"),
                "g": scraped.get("g"),
                "a": scraped.get("a"),
                "p": scraped.get("p"),
            }

    # 2) L10 + matches from game logs
    all_games: list[dict[str, Any]] = []
    l10_done = 0
    if args.with_l10:
        regular_id = comps_by_season[primary_season].get("regular")
        targets = list(matched_meta.items())
        if args.l10_limit:
            targets = targets[: args.l10_limit]
        print(f"Scraping L10 game logs for {len(targets)} players…")
        for i, (pid, meta) in enumerate(targets, start=1):
            path = meta.get("player_path")
            if not path:
                continue
            try:
                # full season view (all comps) then filter ELH in compute_l10
                games = scrape_player_matches(path, primary_season, competition=None)
                # also pull regular-only if empty ELH filter
                elh_games = [
                    g
                    for g in games
                    if "tipsport" in (g.get("competition") or "").lower()
                    or "extralig" in (g.get("competition") or "").lower()
                ]
                if not elh_games and regular_id:
                    games = scrape_player_matches(path, primary_season, competition=regular_id)
                    elh_games = games
                l10 = compute_l10(games)
                season_values.setdefault(pid, {})
                all_games.extend(elh_games)
                merge_into_stats(
                    stats,
                    {"player_id": pid, "name": meta.get("name")},
                    season_values.get(pid, {}),
                    l10,
                    meta,
                )
                l10_done += 1
                if i % 25 == 0 or i == len(targets):
                    print(f"  L10 {i}/{len(targets)}")
            except Exception as exc:  # noqa: BLE001
                print(f"  WARN L10 failed for {meta.get('name')}: {exc}")

        matches = collect_matches_from_games(all_games)
        MATCHES_RAW.write_text(
            json.dumps(matches, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"Collected unique ELH matches from logs: {len(matches)}")
    else:
        # still merge season stats without L10
        for pid, meta in matched_meta.items():
            merge_into_stats(
                stats,
                {"player_id": pid, "name": meta.get("name")},
                season_values.get(pid, {}),
                None,
                meta,
            )

    report = {
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "seasons": seasons,
        "competitions": comps_by_season,
        "matched_players": matched,
        "roster_size": len(roster),
        "unmatched_scraped_sample": unmatched[:40],
        "l10_players": l10_done,
        "with_l10": bool(args.with_l10),
    }
    REPORT_RAW.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if args.dry_run:
        print("Dry-run: stats JSON not written.")
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 0

    save_stats(stats)
    print(f"Updated {STATS_JSON}")

    if args.export_xlsx:
        export_path = Path(__file__).resolve().parent / "export-extraliga-players-xlsx.py"
        spec = importlib.util.spec_from_file_location("export_extraliga_players_xlsx", export_path)
        assert spec and spec.loader
        export_mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(export_mod)
        export_mod.main()

    print("Done.")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Scrape Tipsport ELH stats from Hokej.cz")
    p.add_argument(
        "--seasons",
        default="2025,2024,2023,2022",
        help="Čárkou oddělené startovní roky sezon (2025 = 2025/26)",
    )
    p.add_argument("--with-l10", action="store_true", help="Stáhnout game-logy a spočítat L10")
    p.add_argument(
        "--l10-limit",
        type=int,
        default=0,
        help="Limit hráčů pro L10 (0 = všichni matchnutí)",
    )
    p.add_argument("--include-playoff", action="store_true", help="Stáhnout i play-off tabulku")
    p.add_argument("--export-xlsx", action="store_true", help="Po zápisu přegenerovat Excel")
    p.add_argument("--dry-run", action="store_true", help="Nesepisovat stats JSON")
    return p


if __name__ == "__main__":
    raise SystemExit(run(build_parser().parse_args()))
