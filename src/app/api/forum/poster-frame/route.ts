import { NextRequest, NextResponse } from "next/server";
import { withForumJson, requireForumUser } from "@/lib/community/forumRoute";
import { saveForumPosterPngFromBase64 } from "@/lib/community/saveForumPosterImage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return withForumJson(async ({ userId }) => {
    requireForumUser(userId);
    try {
      const body = (await req.json().catch(() => ({}))) as { pngBase64?: unknown };
      const pngBase64 = typeof body.pngBase64 === "string" ? body.pngBase64 : "";
      if (!pngBase64.trim()) {
        return NextResponse.json({ error: "Chybí pngBase64." }, { status: 400 });
      }
      const url = await saveForumPosterPngFromBase64(pngBase64);
      return NextResponse.json({ url });
    } catch (e) {
      console.error("POST /api/forum/poster-frame:", e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Nepodařilo se uložit obrázek." },
        { status: 400 }
      );
    }
  });
}
