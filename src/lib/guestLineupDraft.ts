import type { LineupStructure } from "@/types";

const MATCH_KEY = "lineup:guest-draft:match";
const NOMINATION_KEY = "lineup:guest-draft:nomination";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

type GuestDraftBase = {
  lineup: LineupStructure;
  captainId: string | null;
  title: string;
  /** Po návratu z Google otevřít dialog uložení. */
  resumeSave: boolean;
  savedAt: number;
};

export type MatchGuestDraft = GuestDraftBase & {
  poolKey: string;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
};

export type NominationGuestDraft = GuestDraftBase;

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as T & { savedAt?: number };
    if (!parsed || typeof parsed !== "object") return null;
    const savedAt = typeof parsed.savedAt === "number" ? parsed.savedAt : 0;
    if (!savedAt || Date.now() - savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota */
  }
}

function clearKey(key: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function readMatchGuestDraft(): MatchGuestDraft | null {
  const d = readJson<MatchGuestDraft>(MATCH_KEY);
  if (!d || !d.lineup || typeof d.poolKey !== "string") return null;
  return d;
}

export function writeMatchGuestDraft(draft: Omit<MatchGuestDraft, "savedAt">) {
  const prev = readMatchGuestDraft();
  writeJson(MATCH_KEY, {
    ...draft,
    resumeSave: draft.resumeSave || Boolean(prev?.resumeSave),
    savedAt: Date.now(),
  } satisfies MatchGuestDraft);
}

export function clearMatchGuestDraft() {
  clearKey(MATCH_KEY);
}

export function readNominationGuestDraft(): NominationGuestDraft | null {
  const d = readJson<NominationGuestDraft>(NOMINATION_KEY);
  if (!d || !d.lineup) return null;
  return d;
}

export function writeNominationGuestDraft(draft: Omit<NominationGuestDraft, "savedAt">) {
  const prev = readNominationGuestDraft();
  writeJson(NOMINATION_KEY, {
    ...draft,
    resumeSave: draft.resumeSave || Boolean(prev?.resumeSave),
    savedAt: Date.now(),
  } satisfies NominationGuestDraft);
}

export function clearNominationGuestDraft() {
  clearKey(NOMINATION_KEY);
}
