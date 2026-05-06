import { cookies } from "next/headers";
import { CONTEST_ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";

export async function requireAdminOrThrow(): Promise<void> {
  const token = (await cookies()).get(CONTEST_ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
}

