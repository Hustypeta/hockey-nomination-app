"use client";

import { useCallback, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminPasswordLoginForm } from "@/components/admin/AdminPasswordLoginForm";
import { SiteHeader } from "@/components/site/SiteHeader";
import { CommunityPostCard } from "@/components/komunita/CommunityPostCard";
import { NewPostModal } from "@/components/komunita/NewPostModal";
import { PostDetailPanel } from "@/components/komunita/PostDetailPanel";
import {
  COMMUNITY_CATEGORY_LABELS,
  COMMUNITY_CATEGORY_ORDER,
  COMMUNITY_SORT_LABELS,
  type CommunitySortMode,
} from "@/lib/community/categories";
import type { CommunityPostCategory } from "@prisma/client";
import type { CommunityPostDto } from "@/lib/community/types";
import { initJerseyNameDisambiguation } from "@/lib/jerseyDisplayName";
import type { Player } from "@/types";

export function CommunityForumApp() {
  const { status, data: session } = useSession();
  const [adminOk, setAdminOk] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [posts, setPosts] = useState<CommunityPostDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<CommunitySortMode>("new");
  const [category, setCategory] = useState<CommunityPostCategory | "">("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [likeBusySlug, setLikeBusySlug] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [q, setQ] = useState("");

  const checkAdmin = useCallback(async () => {
    const res = await fetch("/api/admin/session", { credentials: "include", cache: "no-store" });
    setAdminOk(res.ok);
    setAdminChecked(true);
  }, []);

  useEffect(() => {
    void checkAdmin();
  }, [checkAdmin]);

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then((data: Player[]) => {
        const list = Array.isArray(data) ? data : [];
        setPlayers(list);
        initJerseyNameDisambiguation(list);
      })
      .catch(() => setPlayers([]));
  }, []);

  const loadPosts = useCallback(async () => {
    if (!adminOk) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (category) params.set("category", category);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/komunita/posts?${params}`, {
        credentials: "include",
      });
      const data = (await res.json()) as { posts?: CommunityPostDto[]; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Feed se nenačetl.");
        return;
      }
      const list = data.posts ?? [];
      setPosts(list);
      setSelectedSlug((cur) => (cur && !list.some((p) => p.slug === cur) ? null : cur));
    } finally {
      setLoading(false);
    }
  }, [adminOk, sort, category, q]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const updatePostInList = (updated: CommunityPostDto) => {
    setPosts((prev) =>
      prev
        .map((p) => (p.slug === updated.slug ? updated : p))
        .sort((a, b) => {
          if (a.pinnedAt && !b.pinnedAt) return -1;
          if (!a.pinnedAt && b.pinnedAt) return 1;
          return 0;
        })
    );
  };

  const toggleLike = async (slug: string) => {
    if (status !== "authenticated") {
      toast.error("Pro lajk se přihlas Google účtem.");
      return;
    }
    setLikeBusySlug(slug);
    try {
      const res = await fetch(`/api/admin/komunita/posts/${encodeURIComponent(slug)}/like`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { liked?: boolean; likeCount?: number; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Lajk selhal.");
        return;
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.slug === slug
            ? {
                ...p,
                likedByMe: !!data.liked,
                likeCount: data.likeCount ?? p.likeCount,
              }
            : p
        )
      );
    } finally {
      setLikeBusySlug(null);
    }
  };

  if (!adminChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!adminOk) {
    return (
      <AdminPasswordLoginForm
        title="Komunita (admin preview)"
        description="Skryté fórum pro testování. Stejné admin heslo jako u ostatních admin stránek."
        onLoggedIn={checkAdmin}
      />
    );
  }

  return (
    <div className="sestava-page-ambient min-h-screen pb-24 text-white">
      <div className="sticky top-0 z-40">
        <SiteHeader />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-amber-300/90">
              Admin preview · není v menu
            </p>
            <h1 className="mt-1 font-sans text-2xl font-bold text-white">Komunita</h1>
            <p className="mt-1 max-w-xl text-sm text-white/55">
              Feed, kategorie, přílohy sestav, lajky a komentáře. Veřejné URL zatím ne — jen pro
              testování.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadPosts()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Obnovit
            </button>
            {status === "authenticated" ? (
              <button
                type="button"
                onClick={() => setNewOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c8102e] to-[#003087] px-4 py-2 text-sm font-bold"
              >
                <Plus className="h-4 w-4" />
                Nový příspěvek
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void signIn("google")}
                className="rounded-xl border border-cyan-500/40 px-4 py-2 text-sm text-cyan-200"
              >
                Přihlásit Google (psaní)
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as CommunitySortMode)}
            className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm"
          >
            {(Object.keys(COMMUNITY_SORT_LABELS) as CommunitySortMode[]).map((s) => (
              <option key={s} value={s}>
                {COMMUNITY_SORT_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CommunityPostCategory | "")}
            className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm"
          >
            <option value="">Všechny kategorie</option>
            {COMMUNITY_CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {COMMUNITY_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hledat…"
            className="min-w-[140px] flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {loading && posts.length === 0 ? (
              <p className="text-sm text-white/50">Načítám feed…</p>
            ) : posts.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-white/50">
                Zatím žádné příspěvky. Přihlas Google a vytvoř první.
              </p>
            ) : (
              posts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  players={players}
                  selected={selectedSlug === post.slug}
                  onSelect={() => setSelectedSlug(post.slug)}
                  onToggleLike={() => void toggleLike(post.slug)}
                  likeBusy={likeBusySlug === post.slug}
                />
              ))
            )}
          </div>

          <div className="sestava-premium-panel-dark sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl p-5">
            {selectedSlug ? (
              <PostDetailPanel
                slug={selectedSlug}
                players={players}
                onPostUpdated={updatePostInList}
                onDeleted={() => {
                  setSelectedSlug(null);
                  void loadPosts();
                }}
              />
            ) : (
              <p className="text-sm text-white/50">Klikni na příspěvek pro detail a komentáře.</p>
            )}
          </div>
        </div>
      </div>

      <NewPostModal open={newOpen} onClose={() => setNewOpen(false)} onCreated={() => void loadPosts()} />
    </div>
  );
}
