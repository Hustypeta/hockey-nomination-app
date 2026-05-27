import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getThrownStatus, requireAdminOrThrow } from "@/lib/matchAdmin";

export async function withAdminJson(
  handler: (ctx: { userId: string | null }) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    await requireAdminOrThrow();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;
    return await handler({ userId });
  } catch (e: unknown) {
    const status = getThrownStatus(e) ?? 500;
    const message =
      status === 401
        ? "Neautorizováno — nejdřív admin heslo."
        : e instanceof Error
          ? e.message
          : "Chyba serveru.";
    return NextResponse.json({ error: message }, { status });
  }
}

export function requireUserId(userId: string | null): string {
  if (!userId) {
    throw Object.assign(
      new Error("Pro psaní se přihlas Google účtem (vedle admin hesla)."),
      { status: 401 }
    );
  }
  return userId;
}
