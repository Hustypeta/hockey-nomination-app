import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string; playerId: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Přihlas se." }, { status: 401 });
  }

  const { id: albumId, playerId } = await ctx.params;
  const album = await prisma.playerAlbum.findFirst({
    where: { id: albumId, userId: session.user.id },
    select: { id: true },
  });
  if (!album) {
    return NextResponse.json({ error: "Album nenalezeno." }, { status: 404 });
  }

  const deleted = await prisma.playerAlbumItem.deleteMany({
    where: { albumId, playerId },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Hráč v albu není." }, { status: 404 });
  }

  await prisma.playerAlbum.update({
    where: { id: albumId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
