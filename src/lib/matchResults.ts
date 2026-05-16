import { resolveBeijirMatchResult, type BeijirMatchResult } from "@/lib/beijirMatchResults";
import { resolveMs2026MatchResult } from "@/lib/ms2026MatchResults";

export type MatchResult = BeijirMatchResult;

export function resolveMatchResult(opts: {
  slug: string;
  category?: string | null;
  homeCode?: string | null;
  awayCode?: string | null;
}): MatchResult | undefined {
  return resolveBeijirMatchResult(opts) ?? resolveMs2026MatchResult(opts);
}
