#!/usr/bin/env python3
"""Stabilní cand_* ID — stejný vzorec jako src/lib/ms2026Candidates.ts."""

from __future__ import annotations

import hashlib

LEGACY_NAME_FOR_STABLE_ID = {
    "Jaroslav Chmelař": "Jaroslav Chmelář",
}


def stable_candidate_player_id(name: str, club: str, role_key: str) -> str:
    display = (name or "").strip()
    id_name = LEGACY_NAME_FOR_STABLE_ID.get(display, display)
    payload = f"{id_name}|{(club or '').strip()}|{(role_key or '').strip()}"
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    return f"cand_{digest[:24]}"


def stable_pool_player_id(pool_key: str, name: str, club: str, role_key: str) -> str:
    """ID pro junior / ženy / ELH pool (ne A-tým s historickými cand_)."""
    if pool_key == "repre_a":
        return stable_candidate_player_id(name, club, role_key)
    prefix = {
        "repre_u20": "u20",
        "repre_u18": "u18",
        "repre_zeny": "zen",
    }.get(pool_key, "pl")
    if pool_key.startswith("elh:"):
        prefix = "elh"
        # keep existing Extraliha hash without pool in payload (compatible with Excel player_id)
        payload = f"{(name or '').strip()}|{(club or '').strip()}|{(role_key or '').strip()}"
        digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
        return f"elh_{digest[:24]}"
    payload = f"{pool_key}|{(name or '').strip()}|{(club or '').strip()}|{(role_key or '').strip()}"
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    return f"{prefix}_{digest[:24]}"
