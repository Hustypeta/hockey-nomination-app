import { NextRequest, NextResponse } from "next/server";
import type { CommunityPostCategory, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { CommunitySortMode } from "@/lib/community/categories";
import { postInclude, serializePost } from "@/lib/community/serialize";
import { prisma } from "@/lib/prisma";

function parseSort(raw: string | null): CommunitySortMode {
  if (raw === "top" || raw === "discussed") return raw;
  return "new";
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    const { searchParams } = req.nextUrl;
    const sort = parseSort(searchParams.get("sort"));
    const category = searchParams.get("category") as CommunityPostCategory | null;
    const q = searchParams.get("q")?.trim();
    const take = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 30) || 30));

    const where: Prisma.CommunityPostWhereInput = {
      status: "PUBLISHED",
      deletedAt: null,
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { bodyMd: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.CommunityPostOrderByWithRelationInput[] =
      sort === "top"
        ? [{ pinnedAt: "desc" }, { score: "desc" }, { createdAt: "desc" }]
        : sort === "discussed"
          ? [{ pinnedAt: "desc" }, { commentCount: "desc" }, { createdAt: "desc" }]
          : [{ pinnedAt: "desc" }, { createdAt: "desc" }];

    const [rows, postCount] = await Promise.all([
      prisma.communityPost.findMany({ where, orderBy, take, include: postInclude }),
      prisma.communityPost.count({ where }),
    ]);

    const liked = userId
      ? await prisma.communityPostLike.findMany({
          where: { userId, postId: { in: rows.map((r) => r.id) } },
          select: { postId: true },
        })
      : [];
    const likedSet = new Set(liked.map((l) => l.postId));

    return NextResponse.json({
      posts: rows.map((r) => serializePost(r, likedSet.has(r.id))),
      stats: { postCount },
    });
  } catch (e: unknown) {
    console.error("GET /api/komunita/posts failed:", e);
    return NextResponse.json({ error: "Chyba při načítání komunity." }, { status: 500 });
  }
}

