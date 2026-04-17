import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateNominationPayload } from "@/lib/nominationPayloadServer";
import {
  getTimeBonusPercentForInstant,
  isNominationSubmissionOpen,
} from "@/lib/contestTimeBonus";

/**
 * Jednorázové odeslání sestavy do soutěže (jeden řádek na uživatele).
 * Zapisuje časový bonus podle okamžiku odeslání.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Pro odeslání do soutěže se musíš přihlásit přes Google." },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Tělo požadavku musí být platný JSON." }, { status: 400 });
    }

    let parsed;
    try {
      parsed = validateNominationPayload(body);
    } catch (e) {
      console.error("submit-nomination validate / candidates:", e);
      return NextResponse.json(
        { error: "Na serveru se nepodařilo ověřit soupisku (data hráčů). Zkontroluj nasazení aplikace." },
        { status: 500 }
      );
    }
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const { selectedPlayerIds, captainId, lineupStructure, title } = parsed.payload;

    const now = new Date();
    if (!isNominationSubmissionOpen(now)) {
      return NextResponse.json(
        {
          error:
            "Uzávěrka soutěže už proběhla (13. 5. 2026 23:59). Nominaci do soutěže už nelze odeslat.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { contestEntryNominationId: true },
    });

    if (existing?.contestEntryNominationId) {
      return NextResponse.json(
        { error: "Do soutěže už jsi ze svého účtu nominaci odeslal — znovu to nejde." },
        { status: 400 }
      );
    }

    const timeBonusPercent = getTimeBonusPercentForInstant(now);

    /**
     * Bez interaktivního `prisma.$transaction(callback)` — s PrismaPg + poolerem (Railway) často padá P2028
     * „Transaction not found“. Sekvence create → update + rollback při chybě update.
     */
    const nomination = await prisma.nomination.create({
      data: {
        userId: session.user.id,
        selectedPlayerIds,
        captainId,
        lineupStructure: lineupStructure ?? undefined,
        timeBonusPercent,
        title,
      },
    });
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { contestEntryNominationId: nomination.id },
      });
    } catch (linkErr) {
      await prisma.nomination.delete({ where: { id: nomination.id } }).catch(() => undefined);
      throw linkErr;
    }

    return NextResponse.json({
      id: nomination.id,
      message: "Nominace je v soutěži",
      createdAt: nomination.createdAt.toISOString(),
      timeBonusPercent: nomination.timeBonusPercent,
    });
  } catch (e) {
    console.error("POST /api/contest/submit-nomination:", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2028") {
        return NextResponse.json(
          {
            error:
              "Databázové spojení přerušilo transakci — zkus odeslat znovu za chvíli. Pokud to padá opakovaně, zkontroluj pooler (PgBouncer) vs. přímé připojení k Postgresu.",
          },
          { status: 503 }
        );
      }
      if (e.code === "P2002") {
        return NextResponse.json(
          { error: "Konflikt záznamu (duplicita). Zkus odeslat znovu — z jednoho účtu jde jen jedna soutěžní nominace." },
          { status: 409 }
        );
      }
      if (e.code === "P2003") {
        return NextResponse.json(
          { error: "Účet v databázi neodpovídá relaci — zkus se odhlásit a znovu přihlásit." },
          { status: 400 }
        );
      }
    }
    return NextResponse.json({ error: "Odeslání se nepovedlo." }, { status: 500 });
  }
}
