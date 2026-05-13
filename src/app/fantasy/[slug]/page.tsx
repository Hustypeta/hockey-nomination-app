import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import { MsFantasyDayEditor } from "@/components/ms-fantasy/MsFantasyDayEditor";
import { SiteShell } from "@/components/site/SiteShell";
import { authOptions } from "@/lib/auth";
import {
  SITE_OG_DEFAULT_IMAGE_HEIGHT,
  SITE_OG_DEFAULT_IMAGE_URL,
  SITE_OG_DEFAULT_IMAGE_WIDTH,
} from "@/lib/siteBranding";
import { isMsFantasyVisibleToUsers } from "@/lib/msFantasyConfig";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;

  const titleBase = slug?.trim() ?? "fantasy";
  const title = `Fantasy MS · den ${decodeURIComponent(titleBase)}`;

  return {
    title,
    alternates: { canonical: `/fantasy/${slug}` },
    description: `Odevzdání fantasy sestavy pro hrací den ${slug}.`,
    openGraph: {
      title,
      description: `Odevzdání fantasy sestavy pro hrací den ${slug}.`,
      url: `/fantasy/${slug}`,
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
      title,
      description: `Odevzdání fantasy sestavy pro hrací den ${slug}.`,
      images: [SITE_OG_DEFAULT_IMAGE_URL],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function FantasyDayPage(props: Props) {
  const { slug } = await props.params;

  if (!isMsFantasyVisibleToUsers()) notFound();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const path = `/fantasy/${encodeURIComponent(slug)}`;
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(path)}`);
  }

  return (
    <SiteShell>
      <MsFantasyDayEditor slug={slug} />
    </SiteShell>
  );
}
