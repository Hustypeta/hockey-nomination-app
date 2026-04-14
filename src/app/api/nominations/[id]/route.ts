import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolvePlayersByIds } from "@/lib/resolveNominationPlayers";
import { normalizeNominationTitle } from "@/lib/nominationTitle";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const nomination = await prisma.nomination.findUnique({
      where: { id },
    });

    if (!nomination) {
      return NextResponse.json({ error: "Nominace nenalezena" }, { status: 404 });
    }

    const orderedPlayers = await resolvePlayersByIds(nomination.selectedPlayerIds);

    return NextResponse.json({
      id: nomination.id,
      captainId: nomination.captainId,
      players: orderedPlayers,
      createdAt: nomination.createdAt,
      timeBonusPercent: nomination.timeBonusPercent,
      title: nomination.title,
    });
  } catch (error) {
    console.error("Failed to fetch nomination:", error);
    return NextResponse.json(
      { error: "Failed to fetch nomination" },
      { status: 500 }
    );
  }
}

/** Přejmenování nominace (pouze vlastník). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejseš přihlášený." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.nomination.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Nominace nenalezena" }, { status: 404 });
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Tuto nominaci upravit nemůžeš." }, { status: 403 });
    }

    const body = await request.json();
    if (!body || typeof body !== "object" || !("title" in body)) {
      return NextResponse.json({ error: "Chybí pole title." }, { status: 400 });
    }

    const title = normalizeNominationTitle((body as { title?: unknown }).title);

    const updated = await prisma.nomination.update({
      where: { id },
      data: { title },
      select: { id: true, title: true },
    });

    return NextResponse.json({ id: updated.id, title: updated.title });
  } catch (error) {
    console.error("PATCH /api/nominations/[id] failed:", error);
    return NextResponse.json({ error: "Uložení se nepovedlo." }, { status: 500 });
  }
}
