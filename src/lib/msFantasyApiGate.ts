import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { isMsFantasyVisibleToUsers } from "./msFantasyConfig";

/** Vrací 404 jen když je fantasy explicitně vypnutý (`NEXT_PUBLIC_MS_FANTASY_VISIBLE=false`). */
export function msFantasyNotEnabledResponse(): NextResponse | null {
  if (!isMsFantasyVisibleToUsers()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return null;
}

/** Seznam dnů, soupiska a editor — jen po přihlášení (stejně jako uložená sestava v `my-lineup`). */
export async function msFantasyRequireSessionResponse(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Pro fantasy se přihlas." }, { status: 401 });
  }
  return null;
}
