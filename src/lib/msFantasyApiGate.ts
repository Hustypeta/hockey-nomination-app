import { NextResponse } from "next/server";
import { isMsFantasyVisibleToUsers } from "./msFantasyConfig";

/** Vrací 404 dokud funkci veřejně nezapneš přes NEXT_PUBLIC_MS_FANTASY_VISIBLE. */
export function msFantasyNotEnabledResponse(): NextResponse | null {
  if (!isMsFantasyVisibleToUsers()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return null;
}
