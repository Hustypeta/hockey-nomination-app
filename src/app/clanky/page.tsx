import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteShell } from "@/components/site/SiteShell";
import { breadcrumbJsonLd, pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.clanky);

const ARTICLES = [
  {
    href: PAGE_SEO.rady.path,
    title: "Rady k nominaci",
    description: PAGE_SEO.rady.description,
  },
  {
    href: PAGE_SEO.kurzy.path,
    title: PAGE_SEO.kurzy.title,
    description: PAGE_SEO.kurzy.description,
  },
] as const;

export default function ClankyIndexPage() {
  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Úvod", path: "/" },
          { name: "Články", path: "/clanky" },
        ])}
      />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Blog</p>
        <h1 className="font-display mt-2 text-3xl font-black text-white sm:text-4xl">Články</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
          Tipy k nominaci české reprezentace, analýza kurzů na MS a další texty kolem editoru
          sestavy. Nové články o extralize a historických sestavách přidáváme průběžně.
        </p>
        <ul className="mt-8 space-y-4">
          {ARTICLES.map((article) => (
            <li key={article.href}>
              <Link
                href={article.href}
                className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <h2 className="font-display text-xl font-black text-white">{article.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{article.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </SiteShell>
  );
}
