import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PickemAdminPage } from "@/components/admin/PickemAdminPage";

export const metadata: Metadata = {
  title: "Admin — Pick'em vyhodnocení",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ accessKey: string }> };

export default async function AdminPickemAliasPage({ params }: Props) {
  const { accessKey } = await params;
  const expected = process.env.CONTEST_ADMIN_ACCESS_KEY?.trim();
  if (!expected || accessKey !== expected) notFound();
  return <PickemAdminPage />;
}
