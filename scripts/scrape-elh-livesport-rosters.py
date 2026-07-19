#!/usr/bin/env python3
"""
Stáhne aktuální soupisky Tipsport extraligy z Livesport.cz
a zapíše czech-extraliga-players.json (+ volitelně Excel).

Použití:
  python scripts/scrape-elh-livesport-rosters.py
  python scripts/scrape-elh-livesport-rosters.py --export-xlsx
  python scripts/scrape-elh-livesport-rosters.py --dry-run
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urljoin
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT_JSON = ROOT / "czech-extraliga-players.json"
RAW_DIR = ROOT / "data" / "elh-scrape"
RAW_ROSTERS = RAW_DIR / "livesport-rosters.json"
REPORT = RAW_DIR / "livesport-rosters-report.json"

LEAGUE_URL = "https://www.livesport.cz/hokej/cesko/tipsport-extraliga/"
BASE = "https://www.livesport.cz"
SLEEP_S = 0.3

UA = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "cs,en;q=0.9",
    "X-Fsign": "SW9D1eZo",
}

# Livesport short name / id → club labels used in Lineup fantasy JSON
CLUB_BY_TEAM_ID: dict[str, str] = {
    "tp8PNVFQ": "Bílí Tygři Liberec",
    "YeGlkuUb": "BK Mladá Boleslav",
    "UDlHJ9wl": "HC Dynamo Pardubice",
    "pIEGPioE": "HC Energie Karlovy Vary",
    "AusK09zk": "HC Kometa Brno",
    "rgfiJkOs": "HC Litvínov",
    "UTfYWeKA": "HC Motor České Budějovice",
    "UJFDTRxD": "HC Oceláři Třinec",
    "zVrB6irF": "HC Olomouc",
    "CMBTIThf": "HC Plzeň",
    "zcG9U7N6": "HC Sparta Praha",
    "QDufxqpt": "HC Vítkovice",
    "xdNp4YNk": "Mountfield HK",
    "bLIKOB0K": "Rytíři Kladno",
}


def fetch(url: str) -> str:
    req = Request(url, headers=UA)
    with urlopen(req, timeout=45) as resp:
        return resp.read().decode("utf-8", "replace")


def sleep() -> None:
    time.sleep(SLEEP_S)


def parse_feed_records(blob: str) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []
    for chunk in blob.split("~"):
        fields: dict[str, str] = {}
        for part in chunk.split("¬"):
            if "÷" not in part:
                continue
            key, val = part.split("÷", 1)
            if key:
                fields[key] = val
        if fields:
            records.append(fields)
    return records


def discover_teams(league_html: str) -> list[dict[str, str]]:
    """Vrátí unikátní týmy s id + livesport slug + display name."""
    by_id: dict[str, dict[str, str]] = {}
    for rec in parse_feed_records(league_html):
        if "PX" in rec and "AE" in rec:
            tid = rec["PX"]
            by_id[tid] = {
                "id": tid,
                "name": rec["AE"],
                "slug": rec.get("WU") or by_id.get(tid, {}).get("slug", ""),
            }
        if "PY" in rec and "AF" in rec:
            tid = rec["PY"]
            by_id[tid] = {
                "id": tid,
                "name": rec["AF"],
                "slug": rec.get("WV") or by_id.get(tid, {}).get("slug", ""),
            }
    teams = []
    for tid, meta in by_id.items():
        if tid not in CLUB_BY_TEAM_ID:
            continue
        if not meta.get("slug"):
            continue
        teams.append(
            {
                **meta,
                "club": CLUB_BY_TEAM_ID[tid],
                "soupiska_url": f"{BASE}/tym/{meta['slug']}/{tid}/soupiska/",
            }
        )
    teams.sort(key=lambda t: t["club"])
    return teams


def section_to_position(section: str) -> str | None:
    s = section.lower()
    # ASCII-folded checks for mojibake-safe matching
    if "brank" in s or "gólm" in s or "golm" in s or "goalkeep" in s:
        return "G"
    if "obrán" in s or "obran" in s or "defend" in s:
        return "D"
    if "útoč" in s or "utoc" in s or "forward" in s:
        return "F"
    if "tren" in s or "coach" in s:
        return None
    return None


def livesport_name_to_display(name_raw: str) -> str:
    """'Chlapík Filip' / 'Shore Devin' → 'Filip Chlapík' / 'Devin Shore'."""
    parts = [p for p in name_raw.strip().split() if p]
    if len(parts) < 2:
        return name_raw.strip()
    # Livesport: last tokens are usually given name(s); first is family name.
    # Keep simple: last word = first name, rest = surname (handles 'Pérez Lisa Jaromír'? rare)
    # Observed format is always 'Surname Firstname' or 'Surname First Second'.
    if len(parts) == 2:
        surname, first = parts
        return f"{first} {surname}"
    # 3+ parts: assume last is first name, preceding are surname particles
    first = parts[-1]
    surname = " ".join(parts[:-1])
    return f"{first} {surname}"


def parse_squad(html: str) -> list[dict[str, Any]]:
    players: list[dict[str, Any]] = []
    parts = re.split(
        r'(<div[^>]*class="[^"]*lineupTable__title[^"]*"[^>]*>.*?</div>)',
        html,
        flags=re.S | re.I,
    )
    section = "?"
    for part in parts:
        title_m = re.search(
            r'lineupTable__title[^"]*"[^>]*>(.*?)</div>',
            part,
            re.S | re.I,
        )
        if title_m:
            title = re.sub(r"<[^>]+>", "", title_m.group(1))
            section = re.sub(r"\s+", " ", title).strip()
            continue
        for m in re.finditer(
            r'<a class="lineupTable__cell--name" href="(/hrac/([^/]+)/([^/]+)/)">\s*([^<]+?)\s*</a>',
            part,
        ):
            href, slug, pid, name_raw = m.groups()
            position = section_to_position(section)
            if position is None:
                continue
            players.append(
                {
                    "name": livesport_name_to_display(name_raw.strip()),
                    "name_raw": name_raw.strip(),
                    "position": position,
                    "role": "",
                    "section": section,
                    "livesport_slug": slug,
                    "livesport_id": pid,
                    "livesport_url": urljoin(BASE, href),
                }
            )
    return players


def load_previous_roles() -> dict[tuple[str, str], str]:
    """Map (normalized name, club) → role from previous roster, if any."""
    if not OUT_JSON.exists():
        return {}
    try:
        prev = json.loads(OUT_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    out: dict[tuple[str, str], str] = {}
    for p in prev:
        name = (p.get("name") or "").strip().lower()
        club = (p.get("club") or "").strip()
        role = (p.get("role") or "").strip()
        if name and club and role:
            out[(name, club)] = role
            # also by last name
            parts = name.split()
            if parts:
                out[(parts[-1], club)] = role
    return out


def scrape_all(dry_run: bool = False) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    prev_roles = load_previous_roles()
    print("Loading league page…")
    league_html = fetch(LEAGUE_URL)
    sleep()
    teams = discover_teams(league_html)
    print(f"Teams: {len(teams)}")
    for t in teams:
        print(f"  - {t['club']} ({t['slug']}/{t['id']})")

    raw_by_club: dict[str, Any] = {}
    roster: list[dict[str, Any]] = []
    roles_kept = 0

    for t in teams:
        url = t["soupiska_url"]
        print(f"Scraping {t['club']} …")
        html = fetch(url)
        sleep()
        players = parse_squad(html)
        raw_by_club[t["club"]] = {
            "team": t,
            "players": players,
        }
        counts = Counter(p["position"] for p in players)
        print(f"  -> {len(players)} players {dict(counts)}")
        for p in players:
            role = ""
            key = (p["name"].strip().lower(), t["club"])
            prev = prev_roles.get(key)
            if not prev:
                last = p["name"].strip().lower().split()[-1] if p["name"].strip() else ""
                prev = prev_roles.get((last, t["club"])) if last else None

            if p["position"] == "G":
                role = "G"
            elif p["position"] == "D":
                role = prev if prev in {"D", "RB", "LB"} else "D"
            elif p["position"] == "F":
                role = prev if prev in {"C", "LW", "RW"} else ""
                if role:
                    roles_kept += 1

            roster.append(
                {
                    "name": p["name"],
                    "position": p["position"],
                    "role": role,
                    "club": t["club"],
                    "livesport_id": p["livesport_id"],
                    "livesport_url": p["livesport_url"],
                }
            )

    roster.sort(key=lambda p: (p["club"], p["position"], p["name"]))

    report = {
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "source": LEAGUE_URL,
        "teams": len(teams),
        "players": len(roster),
        "roles_kept_from_previous": roles_kept,
        "by_position": dict(Counter(p["position"] for p in roster)),
        "by_club": {
            club: len(raw_by_club[club]["players"]) for club in sorted(raw_by_club)
        },
    }

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    RAW_ROSTERS.write_text(
        json.dumps(raw_by_club, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if dry_run:
        print("Dry-run: czech-extraliga-players.json not written.")
    else:
        # Backup previous roster once per day stamp
        if OUT_JSON.exists():
            backup = RAW_DIR / f"czech-extraliga-players.backup.json"
            backup.write_text(OUT_JSON.read_text(encoding="utf-8"), encoding="utf-8")
        slim = [
            {
                "name": p["name"],
                "position": p["position"],
                "role": p["role"] or None,
                "club": p["club"],
            }
            for p in roster
        ]
        OUT_JSON.write_text(
            json.dumps(slim, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"Wrote {OUT_JSON} ({len(slim)} players)")

    return roster, report


def export_xlsx() -> None:
    path = Path(__file__).resolve().parent / "export-extraliga-players-xlsx.py"
    spec = importlib.util.spec_from_file_location("export_extraliga_players_xlsx", path)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.main()


def main() -> int:
    parser = argparse.ArgumentParser(description="Scrape ELH rosters from Livesport.cz")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--export-xlsx", action="store_true")
    args = parser.parse_args()

    _roster, report = scrape_all(dry_run=args.dry_run)
    if args.export_xlsx and not args.dry_run:
        export_xlsx()
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
