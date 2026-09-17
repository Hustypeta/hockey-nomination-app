#!/usr/bin/env python3
"""Sdílené konstanty poolů editoru sestavy (Excel ↔ DB)."""

from __future__ import annotations

REPRE_POOLS: list[tuple[str, str, str]] = [
    # poolKey, sheet name, label
    ("repre_a", "A-tym", "A tým"),
    ("repre_u20", "U20", "U20"),
    ("repre_u18", "U18", "U18"),
    ("repre_zeny", "Zeny", "Ženy"),
]

ELH_CLUBS: list[str] = [
    "BK Mladá Boleslav",
    "Bílí Tygři Liberec",
    "HC Dynamo Pardubice",
    "HC Energie Karlovy Vary",
    "HC Kometa Brno",
    "HC Litvínov",
    "HC Motor České Budějovice",
    "HC Oceláři Třinec",
    "HC Olomouc",
    "HC Plzeň",
    "HC Sparta Praha",
    "HC Vítkovice",
    "Mountfield HK",
    "Rytíři Kladno",
]

ELH_CLUB_SHEET: dict[str, str] = {
    "BK Mladá Boleslav": "MLB",
    "Bílí Tygři Liberec": "LIB",
    "HC Dynamo Pardubice": "PCE",
    "HC Energie Karlovy Vary": "KVA",
    "HC Kometa Brno": "BRN",
    "HC Litvínov": "LIT",
    "HC Motor České Budějovice": "CEB",
    "HC Oceláři Třinec": "TRI",
    "HC Olomouc": "OLM",
    "HC Plzeň": "PLZ",
    "HC Sparta Praha": "SPA",
    "HC Vítkovice": "VIT",
    "Mountfield HK": "MHK",
    "Rytíři Kladno": "KLA",
}

SHEET_TO_ELH_CLUB: dict[str, str] = {v: k for k, v in ELH_CLUB_SHEET.items()}
SHEET_TO_ELH_CLUB.update({c: c for c in ELH_CLUBS})


def elh_pool_key(club: str) -> str:
    return f"elh:{club.strip()}"


NATIONAL_HEADERS = [
    ("jmeno", "Jméno hráče"),
    ("player_id", "Stabilní ID (volitelné — při importu se dopočítá)"),
    ("klub", "Aktuální klub / tým"),
    ("pozice_skupina", "F / D / G"),
    ("pozice_detail", "C, LW, RW, RB, LB, G (volitelné)"),
    ("dres", "Číslo dresu (volitelné)"),
    ("poznamka", "Poznámka"),
]

NATIONAL_XLSX = "data/czech-national-players.xlsx"
ELH_XLSX = "data/extraliga-fantasy-players.xlsx"
