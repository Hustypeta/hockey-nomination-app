import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MatchesAdminPage } from "@/components/match/MatchesAdminPage";

export const metadata: Metadata = {
  title: "Admin — zápasy",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ accessKey: string }> };

export default async function AdminMatchesPage({ params }: Props) {
  const { accessKey } = await params;
  const expected = process.env.CONTEST_ADMIN_ACCESS_KEY?.trim();
  if (!expected || accessKey !== expected) notFound();
  return <MatchesAdminPage />;
}

