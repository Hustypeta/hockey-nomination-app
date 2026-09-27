import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Přihlas se." }, { status: 401 });
  }

  const { id: albumId } = await ctx.params;
  const album = await prisma.playerAlbum.findFirst({
    where: { id: albumId, userId: session.user.id },
    select: { id: true },
  });
  if (!album) {
    return NextResponse.json({ error: "Album nenalezeno." }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as { playerId?: unknown };
  const playerId = typeof body.playerId === "string" ? body.playerId.trim() : "";
  if (!playerId) {
    return NextResponse.json({ error: "Chybí hráč." }, { status: 400 });
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: {
      id: true,
      name: true,
      position: true,
      role: true,
      club: true,
      league: true,
      jerseyNumber: true,
      poolKey: true,
    },
  });
  if (!player) {
    return NextResponse.json({ error: "Hráč nenalezen." }, { status: 404 });
  }

  const existing = await prisma.playerAlbumItem.findUnique({
    where: { albumId_playerId: { albumId, playerId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Hráč už v albu je." }, { status: 409 });
  }

  const maxOrder = await prisma.playerAlbumItem.aggregate({
    where: { albumId },
    _max: { sortOrder: true },
  });

  await prisma.$transaction([
    prisma.playerAlbumItem.create({
      data: {
        albumId,
        playerId,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    }),
    prisma.playerAlbum.update({
      where: { id: albumId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return NextResponse.json({
    player: {
      id: player.id,
      name: player.name,
      position: player.position,
      role: player.role,
      club: player.club,
      league: player.league ?? "",
      jerseyNumber: player.jerseyNumber,
      poolKey: player.poolKey,
      pick_rate: 0,
    },
  });
}
