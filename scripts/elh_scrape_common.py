#!/usr/bin/env python3
from __future__ import annotations

import re
import urllib.request
from html.parser import HTMLParser
from typing import Any


DEFAULT_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


class HtmlTableParser(HTMLParser):
    """Parse top-level HTML tables into rows of text cells."""

    def __init__(self) -> None:
        super().__init__()
        self.tables: list[list[list[str]]] = []
        self._depth = 0
        self._in_row = False
        self._in_cell = False
        self._skip = 0
        self._table: list[list[str]] = []
        self._row: list[str] = []
        self._cell: list[str] = []
        self._row_player_href: str | None = None
        self.row_hrefs: list[list[str | None]] = []
        self._hrefs_table: list[str | None] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_d = {k: (v or "") for k, v in attrs}
        if tag == "table":
            if self._depth == 0:
                self._table = []
                self._hrefs_table = []
            self._depth += 1
        elif self._depth == 1 and tag == "tr":
            self._in_row = True
            self._row = []
            self._row_player_href = None
        elif self._in_row and tag in {"td", "th"} and self._depth == 1:
            self._in_cell = True
            self._cell = []
            self._skip = 0
        elif self._in_cell and tag == "a" and "href" in attrs_d:
            href = attrs_d["href"]
            if "/hrac/" in href and self._row_player_href is None:
                self._row_player_href = href
        elif self._in_cell and tag in {"script", "style"}:
            self._skip += 1

    def handle_endtag(self, tag: str) -> None:
        if self._in_cell and tag in {"script", "style"} and self._skip:
            self._skip -= 1
            return
        if tag in {"td", "th"} and self._in_cell and self._depth == 1:
            self._in_cell = False
            text = re.sub(r"\s+", " ", "".join(self._cell)).strip()
            self._row.append(text)
        elif tag == "tr" and self._in_row and self._depth == 1:
            self._in_row = False
            if self._row:
                self._table.append(self._row)
                self._hrefs_table.append(self._row_player_href)
        elif tag == "table" and self._depth:
            self._depth -= 1
            if self._depth == 0 and self._table:
                self.tables.append(self._table)
                self.row_hrefs.append(self._hrefs_table)

    def handle_data(self, data: str) -> None:
        if self._in_cell and self._skip == 0:
            self._cell.append(data)


def fetch_text(url: str, timeout: int = 45) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": DEFAULT_UA,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "cs,en;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", "replace")


def parse_tables(html: str) -> list[list[list[str]]]:
    parser = HtmlTableParser()
    parser.feed(html)
    return parser.tables


def parse_tables_with_hrefs(html: str) -> tuple[list[list[list[str]]], list[list[str | None]]]:
    parser = HtmlTableParser()
    parser.feed(html)
    return parser.tables, parser.row_hrefs


def extract_options(html: str) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    for val, lab in re.findall(r'<option[^>]+value="([^"]*)"[^>]*>(.*?)</option>', html, re.S | re.I):
        label = re.sub(r"<[^>]+>", "", lab)
        label = re.sub(r"\s+", " ", label).strip()
        out.append((val, label))
    return out


def to_int(value: str | None) -> int | None:
    if value is None:
        return None
    text = value.strip().replace("\xa0", " ")
    if not text or text in {"-", "–", "—"}:
        return None
    text = text.replace(",", ".")
    m = re.search(r"-?\d+", text)
    if not m:
        return None
    return int(m.group(0))


def normalize_name(name: str) -> str:
    text = name.strip().lower()
    repl = {
        "á": "a",
        "ä": "a",
        "č": "c",
        "ď": "d",
        "é": "e",
        "ě": "e",
        "í": "i",
        "ň": "n",
        "ó": "o",
        "ö": "o",
        "ř": "r",
        "š": "s",
        "ť": "t",
        "ú": "u",
        "ů": "u",
        "ü": "u",
        "ý": "y",
        "ž": "z",
    }
    for src, dst in repl.items():
        text = text.replace(src, dst)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_club(club: str) -> str:
    text = normalize_name(club)
    # drop common prefixes / noise
    for token in [
        "hc ",
        "bk ",
        "banes motor ",
        "motor ",
        "rytiri ",
        "bili tygri ",
        "mountfield ",
        "skoda ",
        "verva ",
        "ocelari ",
        "dynamo ",
        "energie ",
        "vitkovice ridera ",
        "vitkovice ",
    ]:
        if text.startswith(token):
            text = text[len(token) :]
    aliases = {
        "ceske budejovice": "budejovice",
        "c budejovice": "budejovice",
        "trinec": "trinec",
        "pardubice": "pardubice",
        "sparta praha": "sparta",
        "kometa brno": "kometa",
        "mlada boleslav": "boleslav",
        "karlovy vary": "vary",
        "litvinov": "litvinov",
        "olomouc": "olomouc",
        "plzen": "plzen",
        "liberec": "liberec",
        "kladno": "kladno",
        "hradec kralove": "hradec",
        "hk": "hradec",
    }
    return aliases.get(text, text)


def player_path_from_href(href: str | None) -> str | None:
    if not href:
        return None
    path = href.split("?")[0]
    m = re.search(r"/hrac/([^/]+)/(\d+)", path)
    if not m:
        return None
    return f"/hrac/{m.group(1)}/{m.group(2)}"


def season_key(season_start: int) -> str:
    """2025 -> 2025_26"""
    return f"{season_start}_{str(season_start + 1)[-2:]}"
