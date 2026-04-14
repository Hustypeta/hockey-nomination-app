import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Zda přihlášený uživatel už odeslal nominaci do soutěže. */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ submitted: false, nominationId: null as string | null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { contestEntryNominationId: true },
    });

    return NextResponse.json({
      submitted: !!user?.contestEntryNominationId,
      nominationId: user?.contestEntryNominationId ?? null,
    });
  } catch (e) {
    console.error("GET /api/contest/submission-status:", e);
    return NextResponse.json(
      { submitted: false, nominationId: null as string | null },
      { status: 500 }
    );
  }
}
