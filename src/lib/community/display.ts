export function authorInitials(name: string | null | undefined): string {
  const trimmed = name?.trim();
  if (!trimmed) return "H";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

/** One-line comment snippet for Instagram-style card previews. */
export function previewCommentText(bodyMd: string, maxLength = 72): string {
  const plain = bodyMd.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\s+/g, " ").trim();
  if (!plain) return "";
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength - 1).trimEnd()}…`;
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "právě teď";
  if (mins < 60) return `před ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `před ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `před ${days} d`;
  return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "short" });
}
