import type { LucideIcon } from "lucide-react";
import {
  Home,
  LayoutGrid,
  UserCircle,
  Users,
  Trophy,
  MessageSquare,
  BarChart3,
} from "lucide-react";

export type FifaAppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  matchPrefix?: boolean;
};

export function buildFifaAppNav(designPreview: boolean): FifaAppNavItem[] {
  if (designPreview) {
    return [
      { href: "/design/home", label: "Domů", icon: Home },
      { href: "/zapasy/sestava", label: "Editor sestavy", icon: LayoutGrid, matchPrefix: true },
      { href: "/sestava", label: "Editor nominace", icon: LayoutGrid, matchPrefix: true },
      { href: "/ucet", label: "Můj účet", icon: UserCircle, matchPrefix: true },
      { href: "/design/hraci", label: "Hráči", icon: Users, matchPrefix: true },
      { href: "/design/souteze", label: "Soutěže", icon: Trophy, matchPrefix: true },
      { href: "/design/forum", label: "Fórum", icon: MessageSquare, matchPrefix: true },
      { href: "/zebricek", label: "Žebříček", icon: BarChart3 },
    ];
  }

  return [
    { href: "/", label: "Domů", icon: Home },
    { href: "/zapasy/sestava", label: "Editor sestavy", icon: LayoutGrid, matchPrefix: true },
    { href: "/ucet", label: "Můj účet", icon: UserCircle, matchPrefix: true },
    { href: "/hraci", label: "Hráči", icon: Users, matchPrefix: true },
    { href: "/souteze", label: "Soutěže", icon: Trophy, matchPrefix: true },
    { href: "/forum", label: "Fórum", icon: MessageSquare, matchPrefix: true },
    { href: "/zebricek", label: "Žebříček", icon: BarChart3 },
  ];
}

export function isFifaNavItemActive(pathname: string, item: FifaAppNavItem): boolean {
  if (item.href === "/" || item.href === "/design/home") {
    return pathname === "/" || pathname === "/design/home";
  }
  if (item.matchPrefix) {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
