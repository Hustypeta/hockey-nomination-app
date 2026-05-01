import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Načte Pick’em koncept uložený u účtu (jeden záznam na uživatele).
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Pro zobrazení Pick’emu se musíš přihlásit." }, { status: 401 });
  }

  const entry = await prisma.pickemEntry.findUnique({
    where: { userId: session.user.id },
    select: { payload: true, updatedAt: true, createdAt: true },
  });

  if (!entry) return NextResponse.json({ ok: true, payload: null });
  return NextResponse.json({
    ok: true,
    payload: entry.payload,
    updatedAt: entry.updatedAt.toISOString(),
    createdAt: entry.createdAt.toISOString(),
  });
}

