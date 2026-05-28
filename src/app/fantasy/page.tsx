import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import { MsFantasyHome } from "@/components/ms-fantasy/MsFantasyHome";
import { SiteShell } from "@/components/site/SiteShell";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMsFantasySchedulePauseDaySlug } from "@/lib/msFantasyConfig";
import { ms2026FantasyOfficialLockAtIso } from "@/lib/ms2026FantasyOfficialGameDays";
import {
  SITE_OG_DEFAULT_IMAGE_HEIGHT,
  SITE_OG_DEFAULT_IMAGE_URL,
  SITE_OG_DEFAULT_IMAGE_WIDTH,
} from "@/lib/siteBranding";
import { isMsFantasyVisibleToUsers } from "@/lib/msFantasyConfig";

export const metadata: Metadata = {
  title: "Fantasy MS",
  description: "Fantasy nominace hráče na každý hrací den mistrovství světa.",
  alternates: { canonical: "/fantasy" },
  openGraph: {
    title: "Fantasy MS",
    description: "Fantasy nominace hráče na každý hrací den mistrovství světa.",
    url: "/fantasy",
    type: "website",
    locale: "cs_CZ",
    images: [
      {
        url: SITE_OG_DEFAULT_IMAGE_URL,
        width: SITE_OG_DEFAULT_IMAGE_WIDTH,
        height: SITE_OG_DEFAULT_IMAGE_HEIGHT,
        alt: "Lineup · hokejlineup.cz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fantasy MS",
    description: "Fantasy nominace hráče na každý hrací den mistrovství světa.",
    images: [SITE_OG_DEFAULT_IMAGE_URL],
  },
};

export const dynamic = "force-dynamic";

export default async function FantasyIndexPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isMsFantasyVisibleToUsers()) notFound();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=%2Ffantasy");
  }

  const sp = (await searchParams) ?? {};
  const dnyParam = sp.dny;
  const showDays =
    dnyParam === "1" ||
    dnyParam === "true" ||
    (Array.isArray(dnyParam) && (dnyParam.includes("1") || dnyParam.includes("true")));

  if (showDays) {
    return (
      <SiteShell>
        <MsFantasyHome />
      </SiteShell>
    );
  }

  // UX: /fantasy rovnou otevře "aktuální" (nejbližší neuzamčený) den,
  // aby uživatel nemusel hledat v seznamu.
  const rows = await prisma.msFantasyGameDay.findMany({
    orderBy: [{ sortOrder: "asc" }, { lockAt: "asc" }],
    select: { slug: true, lockAt: true },
  });

  const now = Date.now();
  const candidates = rows.filter((d) => !isMsFantasySchedulePauseDaySlug(d.slug));

  const nextOpen = candidates.find((d) => {
    if (isMsFantasySchedulePauseDaySlug(d.slug)) return false;
    const lockIso = ms2026FantasyOfficialLockAtIso(d.slug) ?? d.lockAt.toISOString();
    return new Date(lockIso).getTime() > now;
  });

  // Fallback: pokud je vše locked (nebo jsme v pauze), stejně pošli uživatele
  // na nejbližší dostupný den, aby se nevracel na seznam.
  const fallback = candidates.at(-1) ?? candidates[0];

  const targetSlug = nextOpen?.slug ?? fallback?.slug;
  if (targetSlug) {
    redirect(`/fantasy/${encodeURIComponent(targetSlug)}`);
  }

  return (
    <SiteShell>
      <MsFantasyHome />
    </SiteShell>
  );
}
