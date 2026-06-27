#!/usr/bin/env python3
"""Sdílené funkce pro Extraliga fantasy export a pool builder."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_NATIONALITY_CODE = "CZE"
DEFAULT_NATIONALITY = "Česko"
ROSTER_JSON = ROOT / "czech-extraliga-players.json"
STATS_JSON = ROOT / "data" / "extraliga-player-stats.json"
TIER_CONFIG_JSON = ROOT / "data" / "extraliga-tier-config.json"
POOL_OUTPUT_JSON = ROOT / "data" / "extraliga-pool-output.json"


def stable_player_id(name: str, club: str, role_key: str) -> str:
    payload = f"{name.strip()}|{club.strip()}|{role_key.strip()}"
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    return f"elh_{digest[:24]}"


def fantasy_position(position: str, role: str | None) -> str:
    pos = (position or "").strip().upper()
    r = (role or "").strip().upper()
    if pos == "G":
        return "G"
    if pos == "D":
        return "D"
    if r in {"C", "LW", "RW"}:
        return r
    return ""


def load_roster() -> list[dict[str, Any]]:
    return json.loads(ROSTER_JSON.read_text(encoding="utf-8"))


def load_stats() -> dict[str, dict[str, Any]]:
    if not STATS_JSON.exists():
        return {}
    raw = json.loads(STATS_JSON.read_text(encoding="utf-8"))
    return {k: v for k, v in raw.items() if isinstance(v, dict)}


def load_tier_config() -> dict[str, Any]:
    return json.loads(TIER_CONFIG_JSON.read_text(encoding="utf-8"))


def save_stats(stats: dict[str, dict[str, Any]]) -> None:
    STATS_JSON.parent.mkdir(parents=True, exist_ok=True)
    STATS_JSON.write_text(json.dumps(stats, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def merge_roster_with_stats() -> list[dict[str, Any]]:
    stats = load_stats()
    rows: list[dict[str, Any]] = []
    for p in load_roster():
        name = p.get("name", "")
        club = p.get("club", "")
        position = p.get("position", "")
        role = (p.get("role") or "").strip()
        role_key = role or position
        player_id = stable_player_id(name, club, role_key)
        overlay = stats.get(player_id, {})
        fpos = fantasy_position(position, role)
        rows.append(
            {
                "player_id": player_id,
                "name": overlay.get("display_name") or name,
                "club": club,
                "position": position,
                "role": role,
                "fantasy_position": fpos,
                **{k: overlay.get(k) for k in overlay if k != "display_name"},
            }
        )
    return rows


def num(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def rate(points: Any, gp: Any, min_gp: int) -> float | None:
    p = num(points)
    g = num(gp)
    if p is None or g is None or g < min_gp:
        return None
    return p / g
