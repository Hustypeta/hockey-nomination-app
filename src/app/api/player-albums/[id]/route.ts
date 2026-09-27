import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function clampAlbumName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > 48) return null;
  return name;
}

type Ctx = { params: Promise<{ id: string }> };

async function ownAlbum(userId: string, albumId: string) {
  return prisma.playerAlbum.findFirst({
    where: { id: albumId, userId },
    select: { id: true, name: true },
  });
}

export async function GET(_req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Přihlas se." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const album = await prisma.playerAlbum.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: {
          player: {
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
          },
        },
      },
    },
  });

  if (!album) {
    return NextResponse.json({ error: "Album nenalezeno." }, { status: 404 });
  }

  return NextResponse.json({
    album: {
      id: album.id,
      name: album.name,
      createdAt: album.createdAt.toISOString(),
      updatedAt: album.updatedAt.toISOString(),
      players: album.items.map((item) => ({
        id: item.player.id,
        name: item.player.name,
        position: item.player.position as "G" | "D" | "F",
        role: item.player.role,
        club: item.player.club,
        league: item.player.league ?? "",
        jerseyNumber: item.player.jerseyNumber,
        poolKey: item.player.poolKey,
        pick_rate: 0,
        addedAt: item.createdAt.toISOString(),
      })),
    },
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Přihlas se." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await ownAlbum(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Album nenalezeno." }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as { name?: unknown };
  const name = clampAlbumName(body.name);
  if (!name) {
    return NextResponse.json({ error: "Zadej jméno alba (1–48 znaků)." }, { status: 400 });
  }

  const album = await prisma.playerAlbum.update({
    where: { id },
    data: { name },
    select: { id: true, name: true, updatedAt: true },
  });

  return NextResponse.json({ album });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Přihlas se." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await ownAlbum(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Album nenalezeno." }, { status: 404 });
  }

  await prisma.playerAlbum.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
