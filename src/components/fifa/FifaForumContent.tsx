"use client";

import { useCallback, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2, MessagesSquare, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { FifaAppPage } from "@/components/fifa/FifaAppPage";
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
import {
  FIFA_BTN_PRIMARY,
  FIFA_BTN_SECONDARY,
  FIFA_INPUT,
  FIFA_KICKER,
  FIFA_SELECT,
} from "@/lib/fifa/fifaUiClasses";
import type { Player } from "@/types";

const FORUM_API = "/api/forum";

export function FifaForumContent() {
  const searchParams = useSearchParams();
  const initialPost = searchParams.get("post")?.trim() || null;

  const { status } = useSession();
  const [posts, setPosts] = useState<CommunityPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<CommunitySortMode>("new");
  const [category, setCategory] = useState<CommunityPostCategory | "">("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialPost);
  const [newOpen, setNewOpen] = useState(false);
  const [likeBusySlug, setLikeBusySlug] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (initialPost) setSelectedSlug(initialPost);
  }, [initialPost]);

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
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (category) params.set("category", category);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`${FORUM_API}/posts?${params}`, { cache: "no-store" });
      const data = (await res.json()) as { posts?: CommunityPostDto[]; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Feed se nenačetl.");
        return;
      }
      const list = data.posts ?? [];
      setPosts(list);
      setSelectedSlug((cur) => {
        if (cur && list.some((p) => p.slug === cur)) return cur;
        return list[0]?.slug ?? null;
      });
    } finally {
      setLoading(false);
    }
  }, [sort, category, q]);

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
      const res = await fetch(`${FORUM_API}/posts/${encodeURIComponent(slug)}/like`, {
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

  return (
    <FifaAppPage className="!py-2 lg:!py-2.5">
      <div className="fifa-viewport-page w-full max-w-none">
        <div className="fifa-viewport-page-header flex shrink-0 flex-wrap items-end justify-between gap-2">
          <div className="fifa-page-heading min-w-0">
            <p className={`${FIFA_KICKER} flex items-center gap-1.5`}>
              <MessagesSquare className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Komunita
            </p>
            <h1>Fórum</h1>
            <p>Sdílení nominací, fantasy sestav a diskuze k MS 2026.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadPosts()}
              className={FIFA_BTN_SECONDARY}
              aria-label="Obnovit feed"
            >
              <RefreshCw className={`inline h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            {status === "authenticated" ? (
              <button type="button" onClick={() => setNewOpen(true)} className={FIFA_BTN_PRIMARY}>
                <Plus className="mr-1 inline h-4 w-4" aria-hidden />
                Nový příspěvek
              </button>
            ) : (
              <button type="button" onClick={() => void signIn("google", { callbackUrl: "/forum" })} className={FIFA_BTN_SECONDARY}>
                Přihlásit se
              </button>
            )}
          </div>
        </div>

        <div className="fifa-forum-toolbar mt-2 flex shrink-0 flex-wrap gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as CommunitySortMode)}
            className={FIFA_SELECT}
            aria-label="Řazení"
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
            className={FIFA_SELECT}
            aria-label="Kategorie"
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
            className={`${FIFA_INPUT} min-w-[10rem] flex-1`}
          />
        </div>

        <div className="fifa-forum-grid fifa-viewport-page-body--scroll-mobile mt-2 min-h-0 flex-1">
          <div className="fifa-panel-scroll min-h-0 space-y-2 pr-0.5 lg:pr-1">
            {loading && posts.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-[var(--fifa-text-muted)]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="fifa-empty-state">
                <MessagesSquare className="mx-auto h-8 w-8 text-[var(--fifa-text-muted)]" aria-hidden />
                <p className="mt-2 text-sm">Zatím žádné příspěvky.</p>
                {status === "authenticated" ? (
                  <button type="button" onClick={() => setNewOpen(true)} className={`mt-4 ${FIFA_BTN_PRIMARY}`}>
                    Vytvořit první příspěvek
                  </button>
                ) : null}
              </div>
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
                  fifaUi
                />
              ))
            )}
          </div>

          <aside className="fifa-card flex min-h-0 min-w-0 flex-col overflow-hidden">
            <div className="fifa-card-header">
              <p className={FIFA_KICKER}>Detail příspěvku</p>
            </div>
            <div className="fifa-panel-scroll min-h-0 flex-1 p-3 lg:p-4">
              {selectedSlug ? (
                <PostDetailPanel
                  slug={selectedSlug}
                  players={players}
                  onPostUpdated={updatePostInList}
                  onDeleted={() => {
                    setSelectedSlug(null);
                    void loadPosts();
                  }}
                  fifaUi
                />
              ) : (
                <p className="text-sm text-[var(--fifa-text-muted)]">Vyber příspěvek ze seznamu vlevo.</p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <NewPostModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={() => void loadPosts()}
      />
    </FifaAppPage>
  );
}
