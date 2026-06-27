import { Trophy, Users } from "lucide-react";
import type { FifaHubMenuItem } from "@/components/fifa/FifaHubMenuCard";

export const CESKA_REPREZENTACE_MENU_ITEMS: FifaHubMenuItem[] = [
  {
    href: "/souteze/ceska-reprezentace/a-tym",
    label: "A-tým",
    hint: "MS 2026",
    icon: Trophy,
  },
  {
    href: "/souteze/ceska-reprezentace/u20",
    label: "U20",
    hint: "Do 20 let",
    icon: Users,
  },
  {
    href: "/souteze/ceska-reprezentace/u18",
    label: "U18",
    hint: "Do 18 let",
    icon: Users,
  },
];
