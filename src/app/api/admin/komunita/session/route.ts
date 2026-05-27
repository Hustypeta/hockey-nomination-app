import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { withAdminJson } from "@/lib/community/adminRoute";

/** Admin cookie + volitelná Google session pro autora příspěvků. */
export async function GET() {
  return withAdminJson(async () => {
    const session = await getServerSession(authOptions);
    return NextResponse.json({
      ok: true,
      user: session?.user?.id
        ? {
            id: session.user.id,
            name: session.user.name ?? null,
            email: session.user.email ?? null,
            image: session.user.image ?? null,
          }
        : null,
    });
  });
}
