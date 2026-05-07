function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function publicPlayerCodeFromUserId(userId: string): string {
  const n = fnv1a32(userId);
  const s = n.toString(36).toUpperCase();
  // 4 znaky, stabilně, bez ošklivých dlouhých hashů
  return s.padStart(4, "0").slice(0, 4);
}

export function publicLeaderboardDisplayName(opts: {
  userId: string;
  nickname?: string | null;
}): string {
  const nick = (opts.nickname ?? "").trim();
  if (nick) return nick;
  return `Hráč #${publicPlayerCodeFromUserId(opts.userId)}`;
}

