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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Přihlas se." }, { status: 401 });
  }

  const albums = await prisma.playerAlbum.findMany({
    where: { userId: session.user.id },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });

  return NextResponse.json({
    albums: albums.map((a) => ({
      id: a.id,
      name: a.name,
      playerCount: a._count.items,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Přihlas se." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { name?: unknown };
  const name = clampAlbumName(body.name);
  if (!name) {
    return NextResponse.json({ error: "Zadej jméno alba (1–48 znaků)." }, { status: 400 });
  }

  const album = await prisma.playerAlbum.create({
    data: { userId: session.user.id, name },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({
    album: {
      id: album.id,
      name: album.name,
      playerCount: 0,
      createdAt: album.createdAt.toISOString(),
      updatedAt: album.updatedAt.toISOString(),
    },
  });
}
