/** Krátký náhled z markdown těla příspěvku. */
export function communityPostExcerpt(bodyMd: string, max = 120): string {
  const plain = bodyMd
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_~`>()[\]!|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trim()}…`;
}
