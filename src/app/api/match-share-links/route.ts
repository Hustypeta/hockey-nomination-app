import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allocateShareLinkSlug } from "@/lib/allocateNominationSlug";
import { validateMatchShareBody } from "@/lib/validateMatchShareBody";

function genShareCode(len = 10) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < len; i++) out += chars[arr[i]! % chars.length]!;
  return out;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateMatchShareBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const { title, captainId, lineupStructure, defenseCount, allowExtraForward } = parsed;

    const slug = await allocateShareLinkSlug(prisma, title, null);

    let code = genShareCode(10);
    for (let attempt = 0; attempt < 8; attempt++) {
      const clash = await prisma.matchShareLink.findUnique({ where: { code }, select: { code: true } });
      if (!clash) break;
      code = genShareCode(10);
    }

    await prisma.matchShareLink.create({
      data: {
        code,
        slug,
        captainId,
        lineupStructure: lineupStructure as object,
        title,
        defenseCount,
        allowExtraForward,
      },
    });

    const origin = new URL(request.url).origin;
    const path = `/m/${encodeURIComponent(slug)}`;
    return NextResponse.json({
      code,
      slug,
      path,
      url: `${origin}${path}`,
    });
  } catch (e) {
    console.error("POST /api/match-share-links", e);
    return NextResponse.json({ error: "Nepodařilo se vytvořit odkaz." }, { status: 500 });
  }
}

