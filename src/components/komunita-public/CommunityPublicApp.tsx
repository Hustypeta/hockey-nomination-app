"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { CommunityPostDto } from "@/lib/community/types";
import { CommunityHero } from "@/components/komunita-public/CommunityHero";
import { CommunityCategoryPills } from "@/components/komunita-public/CommunityCategoryPills";
import { CommunitySidebar } from "@/components/komunita-public/CommunitySidebar";
import { CommunityFeedCard } from "@/components/komunita-public/CommunityFeedCard";
import type { PublicCommunityCategory } from "@/components/komunita-public/communityTheme";
import { mapPublicToDbCategory } from "@/components/komunita-public/communityTheme";

type SortMode = "new" | "top" | "discussed";

const SORT_LABELS: Record<SortMode, string> = {
  new: "Nejnovější",
  top: "Top",
  discussed: "Diskutované",
};

export function CommunityPublicApp() {
  const { status } = useSession();
  const [posts, setPosts] = useState<CommunityPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("new");
  const [category, setCategory] = useState<PublicCommunityCategory | "">("");
  const [q, setQ] = useState("");
  const [stats, setStats] = useState<{ postCount: number; userCount?: number | null }>({
    postCount: 0,
  });
  const feedRef = useRef<HTMLDivElement | null>(null);

  const dbCategory = useMemo(() => mapPublicToDbCategory(category), [category]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (dbCategory) params.set("category", dbCategory);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/komunita/posts?${params}`, { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        posts?: CommunityPostDto[];
        stats?: { postCount?: number; userCount?: number | null };
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Komunita se nepodařila načíst.");
        setPosts([]);
        setStats({ postCount: 0 });
        return;
      }
      setPosts(data.posts ?? []);
      setStats({ postCount: data.stats?.postCount ?? (data.posts?.length ?? 0), userCount: data.stats?.userCount });
    } finally {
      setLoading(false);
    }
  }, [sort, dbCategory, q]);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = () => {
    if (status !== "authenticated") {
      toast.error("Pro vytvoření příspěvku se přihlas Google účtem.");
      void signIn("google");
      return;
    }
    toast.message("Tvorba příspěvků zatím přes admin preview.", {
      description: "Ještě to ladíme. Za chvíli to odemkneme pro všechny.",
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#05070f]">
      <CommunityHero
        onCreateClick={onCreate}
        onBrowseClick={() => feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
      />

      <section ref={feedRef} className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-white">Diskuze & sestavy</h2>
            <p className="mt-1 text-sm text-white/55">
              Vyber kategorii, filtruj a hledej. Přidej se do diskuze.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Hledat memy, hráče, analýzy…"
                className="w-full rounded-2xl border border-white/12 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/35 outline-none ring-cyan-500/30 focus:border-cyan-400/25 focus:ring-2 sm:w-[320px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm text-white/80">
                <SlidersHorizontal className="h-4 w-4 text-white/45" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortMode)}
                  className="bg-transparent text-sm outline-none"
                >
                  {(Object.keys(SORT_LABELS) as SortMode[]).map((k) => (
                    <option key={k} value={k} className="bg-[#0a0f1c]">
                      {SORT_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => void load()}
                className="rounded-2xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm font-bold text-white/85 transition hover:border-cyan-400/25 hover:bg-cyan-500/10"
              >
                Obnovit
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <CommunityCategoryPills value={category} onChange={setCategory} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white/60">
                <Loader2 className="h-5 w-5 animate-spin" />
                Načítám feed…
              </div>
            ) : posts.length === 0 ? (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8">
                <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 10px)" }} />
                <p className="relative text-lg font-black text-white">Zatím žádné příspěvky</p>
                <p className="relative mt-2 text-sm text-white/60">
                  Buď první kdo sem hodí meme, analýzu nebo sestavu. Jakmile to odemkneme veřejně,
                  bude to hlavní místo pro diskuzi.
                </p>
                <button
                  type="button"
                  onClick={onCreate}
                  className="relative mt-4 rounded-2xl bg-gradient-to-r from-[#ff2d55] to-[#c8102e] px-4 py-2.5 text-sm font-extrabold text-white"
                >
                  Vytvořit příspěvek
                </button>
              </div>
            ) : (
              posts.map((p) => (
                <CommunityFeedCard
                  key={p.id}
                  post={p}
                  onOpen={() => toast.message("Detail příspěvku doplníme jako další krok (MVP).")}
                />
              ))
            )}
          </div>

          <div className="hidden lg:block">
            <CommunitySidebar posts={posts} stats={stats} />
          </div>
        </div>
      </section>
    </div>
  );
}

