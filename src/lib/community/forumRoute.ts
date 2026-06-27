import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function withForumJson(
  handler: (ctx: { userId: string | null }) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;
    return await handler({ userId });
  } catch (e: unknown) {
    const status =
      e && typeof e === "object" && "status" in e && typeof (e as { status: number }).status === "number"
        ? (e as { status: number }).status
        : 500;
    console.error("/api/forum error:", e);
    const message =
      status === 401 && e instanceof Error
        ? e.message
        : e instanceof Error
          ? e.message
          : "Chyba serveru.";
    return NextResponse.json({ error: message }, { status });
  }
}

export function requireForumUser(userId: string | null): string {
  if (!userId) {
    throw Object.assign(new Error("Pro tuto akci se přihlas přes Google."), { status: 401 });
  }
  return userId;
}
