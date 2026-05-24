import type { NextRequest } from "next/server";

export type AdminEmailSendParams = {
  mode: "dry-run" | "send";
  campaignId: string;
  limit: number | null;
  offset: number;
  throttleMs: number;
  retryFailed: boolean;
  only: string | null;
};

function pickFiniteNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function canonicalKey(k: string) {
  return k.toLowerCase().replace(/_/g, "");
}

function pickFlexible(o: Record<string, unknown>, camelName: string): unknown {
  const want = canonicalKey(camelName);
  for (const [k, v] of Object.entries(o)) {
    if (canonicalKey(k) === want) return v;
  }
  return undefined;
}

function qpFirst(req: NextRequest, ...keys: string[]): string | undefined {
  const sp = req.nextUrl.searchParams;
  for (const k of keys) {
    const v = sp.get(k);
    const t = typeof v === "string" ? v.trim() : "";
    if (t) return t;
  }
  return undefined;
}

/** Query + JSON tělo (PowerShell Invoke-RestMethod). */
export function parseAdminEmailSendParams(
  req: NextRequest,
  body: Record<string, unknown>,
  defaults: { campaignId?: string; throttleMs?: number }
): AdminEmailSendParams {
  const modeRaw = pickFlexible(body, "mode") ?? qpFirst(req, "mode", "Mode");
  const mode = modeRaw === "send" ? "send" : "dry-run";

  const campaignId =
    (typeof pickFlexible(body, "campaignId") === "string" ? String(pickFlexible(body, "campaignId")).trim() : "") ||
    qpFirst(req, "campaignId", "CampaignId") ||
    defaults.campaignId?.trim() ||
    "";

  const limitRaw = pickFiniteNumber(pickFlexible(body, "limit")) ?? pickFiniteNumber(qpFirst(req, "limit", "Limit"));
  const limit = limitRaw !== undefined ? Math.max(1, Math.floor(limitRaw)) : null;

  const offsetRaw = pickFiniteNumber(pickFlexible(body, "offset")) ?? pickFiniteNumber(qpFirst(req, "offset", "Offset"));
  const offset = offsetRaw !== undefined ? Math.max(0, Math.floor(offsetRaw)) : 0;

  const thrRaw =
    pickFiniteNumber(pickFlexible(body, "throttleMs")) ?? pickFiniteNumber(qpFirst(req, "throttleMs", "ThrottleMs"));
  const throttleMs =
    thrRaw !== undefined ? Math.max(0, Math.floor(thrRaw)) : Math.max(0, defaults.throttleMs ?? 350);

  const retryRaw = pickFlexible(body, "retryFailed") ?? qpFirst(req, "retryFailed", "RetryFailed");
  const retryFailed =
    retryRaw === true ||
    String(retryRaw ?? "")
      .trim()
      .toLowerCase() === "true" ||
    String(retryRaw ?? "") === "1";

  const onlyRaw = pickFlexible(body, "only") ?? qpFirst(req, "only", "Only");
  const only =
    typeof onlyRaw === "string" && onlyRaw.trim() ? onlyRaw.trim().toLowerCase() : null;

  return { mode, campaignId, limit, offset, throttleMs, retryFailed, only };
}

export function sliceRecipients<T>(rows: T[], offset: number, limit: number | null): T[] {
  const after = offset > 0 ? rows.slice(offset) : rows;
  return limit != null ? after.slice(0, limit) : after;
}
