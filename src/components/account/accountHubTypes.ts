export type AccountHubSectionId = "lineups" | "contests" | "collections" | "settings";

export const ACCOUNT_HUB_SECTIONS: {
  id: AccountHubSectionId;
  label: string;
}[] = [
  { id: "lineups", label: "Moje sestavy" },
  { id: "contests", label: "Moje soutěže" },
  { id: "collections", label: "Sbírky hráčů" },
  { id: "settings", label: "Nastavení účtu" },
];
