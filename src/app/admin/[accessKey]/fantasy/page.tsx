import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MsFantasyScoringAdminPage } from "@/components/admin/MsFantasyScoringAdminPage";

export const metadata: Metadata = {
  title: "Admin — Fantasy vyhodnocení",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ accessKey: string }> };

/** Stejná stránka jako `/admin/fantasy/[accessKey]` — alias pro konzistenci s `/admin/[accessKey]`. */
export default async function AdminFantasyScoringAliasPage({ params }: Props) {
  const { accessKey } = await params;
  const expected = process.env.CONTEST_ADMIN_ACCESS_KEY?.trim();
  if (!expected || accessKey !== expected) notFound();
  return <MsFantasyScoringAdminPage />;
}
