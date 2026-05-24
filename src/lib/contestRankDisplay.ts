/** Vizuální označení pořadí v žebříčku nominace. */
export function contestRankEmoji(rank: number): string | null {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

export function contestRankLabel(rank: number): string {
  const emoji = contestRankEmoji(rank);
  if (emoji) return `${emoji} ${rank}.`;
  return `${rank}.`;
}

export function contestRankHeadline(rank: number): string {
  if (rank === 1) return "🏆 1. místo";
  if (rank === 2) return "🥈 2. místo";
  if (rank === 3) return "🥉 3. místo";
  return `${rank}. místo`;
}
