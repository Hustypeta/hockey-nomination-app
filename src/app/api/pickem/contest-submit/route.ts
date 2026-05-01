import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Odeslání Pick’em tipů do soutěže (zatím ukládáme jako záznam u účtu; vyhodnocení/leaderboard naváže později).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Pro odeslání Pick’emu do soutěže se musíš přihlásit." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Tělo požadavku musí být platný JSON." }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Chybí payload Pick’em." }, { status: 400 });
    }

    const entry = await prisma.pickemEntry.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        payload: body as object,
      },
      update: {
        payload: body as object,
      },
      select: { id: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, id: entry.id, updatedAt: entry.updatedAt.toISOString() });
  } catch (e) {
    console.error("POST /api/pickem/contest-submit:", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2028") {
        return NextResponse.json(
          { error: "Databázové spojení přerušilo požadavek — zkus to znovu za chvíli." },
          { status: 503 }
        );
      }
    }
    return NextResponse.json({ error: "Odeslání Pick’emu do soutěže se nepovedlo." }, { status: 500 });
  }
}

