import type { LucideIcon } from "lucide-react";
import { EXTRALIGA_DRAFT_FANTASY_TITLE } from "@/lib/fifa/extraligaDraftFantasy";
import {
  BarChart3,
  CalendarDays,
  FileText,
  Flag,
  Home,
  LayoutGrid,
  ListChecks,
  MessageSquare,
  Newspaper,
  Shield,
  Star,
  Trophy,
  UserCircle,
  Users,
} from "lucide-react";

export type FifaSearchEntry = {
  href: string;
  label: string;
  /** Sekce / kontext zobrazený vpravo v nabídce. */
  hint: string;
  icon?: LucideIcon;
  /** Další výrazy (i bez diakritiky / synonyma) pro fulltext. */
  keywords?: string[];
};

/** Statický index hlavních stránek i podstránek pro globální vyhledávání. */
export const FIFA_SEARCH_INDEX: FifaSearchEntry[] = [
  { href: "/", label: "Domů", hint: "Stránka", icon: Home, keywords: ["uvod", "home", "hlavni"] },

  // Editory
  { href: "/zapasy/sestava", label: "Editor sestavy", hint: "Editor", icon: LayoutGrid, keywords: ["sestava na zapas", "lineup", "drag and drop", "tvorba sestavy"] },
  { href: "/sestava", label: "Editor nominace", hint: "Editor", icon: LayoutGrid, keywords: ["nominace", "nominacni sestava", "pool"] },

  // Hráči
  { href: "/hraci", label: "Hráči", hint: "Hráči", icon: Users, keywords: ["pool", "soupiska", "kandidati", "seznam hracu"] },

  // Soutěže
  { href: "/souteze", label: "Soutěže", hint: "Soutěže", icon: Trophy, keywords: ["rozcesti", "competitions"] },
  { href: "/souteze", label: "Česká reprezentace", hint: "Soutěže", icon: Flag, keywords: ["narodni tym", "repre", "cesko", "a tym", "u20", "u18"] },
  { href: "/souteze/ceska-reprezentace/a-tym", label: "A-tým", hint: "Reprezentace", icon: Flag, keywords: ["senior", "seniorska reprezentace", "a tym"] },
  { href: "/souteze/ceska-reprezentace/u20", label: "U20", hint: "Reprezentace", icon: Users, keywords: ["dvacitka", "junioři", "do 20 let"] },
  { href: "/souteze/ceska-reprezentace/u18", label: "U18", hint: "Reprezentace", icon: Users, keywords: ["osmnactka", "do 18 let"] },
  { href: "/souteze/ceska-reprezentace/a-tym", label: "MS 2026", hint: "Soutěže", icon: Trophy, keywords: ["mistrovstvi sveta", "world championship", "tipovacka", "svycarsko", "daily fantasy"] },
  { href: "/souteze/ms-2027", label: "MS 2027", hint: "Soutěže", icon: Trophy, keywords: ["mistrovstvi sveta", "world championship", "nemecko", "germany"] },
  { href: "/souteze/extraliga", label: EXTRALIGA_DRAFT_FANTASY_TITLE, hint: "Soutěže", icon: Shield, keywords: ["draft", "extraliga", "fantasy"] },
  { href: "/souteze/historical-lineup", label: "Historical Lineup", hint: "Soutěže", icon: Trophy, keywords: ["historicke sestavy", "slavne tymy"] },

  // Fórum a žebříček
  { href: "/forum", label: "Fórum", hint: "Komunita", icon: MessageSquare, keywords: ["diskuze", "prispevky", "komunita"] },
  { href: "/zebricek", label: "Žebříček", hint: "Žebříček", icon: BarChart3, keywords: ["leaderboard", "poradi", "vysledky", "body"] },

  // Zápasy
  { href: "/zapasy", label: "Zápasy", hint: "Zápasy", icon: CalendarDays, keywords: ["matches", "rozpis", "program"] },
  { href: "/zapasy/ms-2026", label: "Zápasy MS 2026", hint: "Zápasy", icon: CalendarDays, keywords: ["program ms", "rozpis ms"] },
  { href: "/bracket", label: "Pavouk MS", hint: "Zápasy", icon: Trophy, keywords: ["bracket", "vyrazovaci cast", "playoff"] },

  // Novinky
  { href: "/novinky", label: "Novinky", hint: "Novinky", icon: Newspaper, keywords: ["news", "aktuality"] },
  { href: "/daily-news", label: "Lineup News", hint: "Novinky", icon: Newspaper, keywords: ["zpravy", "denni prehled", "rss", "sport.cz", "livesport", "ct sport", "nhl"] },

  // Účet
  { href: "/ucet", label: "Můj účet", hint: "Účet", icon: UserCircle, keywords: ["profil", "account", "muj ucet"] },
  { href: "/ucet/nominace", label: "Moje nominace", hint: "Účet", icon: ListChecks, keywords: ["ulozene nominace"] },
  { href: "/ucet/zapasove-sestavy", label: "Moje zápasové sestavy", hint: "Účet", icon: LayoutGrid, keywords: ["ulozene sestavy", "lineupy"] },
  { href: "/ucet/hodnoceni", label: "Moje hodnocení", hint: "Účet", icon: Star, keywords: ["znamky", "rating", "hodnoceni hracu"] },
  { href: "/ucet/pickem", label: "Můj Pick'em", hint: "Účet", icon: ListChecks, keywords: ["pickem", "tipy"] },

  // Články a info
  { href: "/clanky/kurzy-a-analyza-ms-2026", label: "Kurzy a analýza MS 2026", hint: "Článek", icon: FileText, keywords: ["sazky", "kurzy", "analyza", "tipsport"] },
  { href: "/clanky/rady-k-nominaci", label: "Rady k nominaci", hint: "Článek", icon: FileText, keywords: ["tipy", "navod", "jak sestavit"] },
  { href: "/kdo-jsem", label: "Kdo jsem", hint: "Info", icon: UserCircle, keywords: ["o projektu", "about", "autor"] },
  { href: "/pravidla-souteze", label: "Pravidla soutěže", hint: "Info", icon: FileText, keywords: ["pravidla", "rules"] },
  { href: "/ochrana-udaju", label: "Ochrana osobních údajů", hint: "Info", icon: FileText, keywords: ["gdpr", "soukromi", "privacy"] },
];

/** Odstraní diakritiku a sjednotí na lowercase pro porovnání. */
export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
