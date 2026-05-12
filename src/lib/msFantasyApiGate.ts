import { NextResponse } from "next/server";
import { isMsFantasyVisibleToUsers } from "./msFantasyConfig";

/** Vrací 404 jen když je fantasy explicitně vypnutý (`NEXT_PUBLIC_MS_FANTASY_VISIBLE=false`). */
export function msFantasyNotEnabledResponse(): NextResponse | null {
  if (!isMsFantasyVisibleToUsers()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return null;
}
