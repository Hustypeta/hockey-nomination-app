import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfficialLineupAdminEditor } from "@/components/admin/OfficialLineupAdminEditor";

export const metadata: Metadata = {
  title: "Admin — oficiální soupiska",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ accessKey: string }>;
};

/** Veřejná cesta `/admin/official-lineup` neexistuje — vstup jen přes `CONTEST_ADMIN_ACCESS_KEY` v env. */
export default async function AdminOfficialLineupPage({ params }: Props) {
  const { accessKey } = await params;
  const expected = process.env.CONTEST_ADMIN_ACCESS_KEY?.trim();
  if (!expected || accessKey !== expected) {
    notFound();
  }

  return <OfficialLineupAdminEditor />;
}
