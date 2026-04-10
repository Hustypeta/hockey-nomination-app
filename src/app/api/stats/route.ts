import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Veřejné statistiky pro landing (konverze / social proof).
 */
export async function GET() {
  try {
    const nominationCount = await prisma.nomination.count();
    return NextResponse.json({ nominationCount });
  } catch {
    return NextResponse.json({ nominationCount: null as number | null });
  }
}
