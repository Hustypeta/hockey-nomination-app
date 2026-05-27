import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommunityForumApp } from "@/components/komunita/CommunityForumApp";

export const metadata: Metadata = {
  title: "Admin — komunita (preview)",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ accessKey: string }>;
};

/** Skryté fórum — vstup jen přes `CONTEST_ADMIN_ACCESS_KEY` v env (stejně jako ostatní admin). */
export default async function AdminKomunitaPage({ params }: Props) {
  const { accessKey } = await params;
  const expected = process.env.CONTEST_ADMIN_ACCESS_KEY?.trim();
  if (!expected || accessKey !== expected) {
    notFound();
  }

  return <CommunityForumApp />;
}
