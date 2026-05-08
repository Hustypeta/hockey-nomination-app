import { cookies } from "next/headers";
import { CONTEST_ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";

/** NextResponse.json status from throwing Object.assign(Error, { status }) */
export function getThrownStatus(e: unknown): number | undefined {
  if (typeof e !== "object" || e === null) return undefined;
  const status = (e as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
}
export async function requireAdminOrThrow(): Promise<void> {
  const token = (await cookies()).get(CONTEST_ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
}

