"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  Clock,
  Loader2,
  MessagesSquare,
  PenLine,
  Plus,
  RefreshCw,
  Search,
  Tags,
} from "lucide-react";
import { toast } from "sonner";
import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import { ForumFeedCarousel } from "@/components/fifa/ForumFeedCarousel";
import { CommunityPostCard, COMMUNITY_SORT_ICONS } from "@/components/komunita/CommunityPostCard";
import { CommunityPostDetailModal } from "@/components/komunita/CommunityPostDetailModal";
import { NewPostModal } from "@/components/komunita/NewPostModal";
import {
  COMMUNITY_CATEGORY_LABELS,
  COMMUNITY_CATEGORY_ORDER,
  COMMUNITY_SORT_LABELS,
  type CommunitySortMode,
} from "@/lib/community/categories";
import type { CommunityPostCategory } from "@prisma/client";
import type { CommunityCommentDto, CommunityPostDto } from "@/lib/community/types";
import { initJerseyNameDisambiguation } from "@/lib/jerseyDisplayName";
import { useContestStats } from "@/hooks/useContestStats";
import { FIFA_BTN_SECONDARY } from "@/lib/fifa/fifaUiClasses";
import type { Player } from "@/types";

const FORUM_API = "/api/forum";

function formatCs(n: number): string {
  return new Intl.NumberFormat("cs-CZ").format(n);
}

export function FifaForumContent() {
  const { data: session, status } = useSession();
  const { communityUsersCount } = useContestStats();

  const [posts, setPosts] = useState<CommunityPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<CommunitySortMode>("new");
  const [category, setCategory] = useState<CommunityPostCategory | "">("");
  const [detailSlug, setDetailSlug] = useState<string | null>(null);
  const [commentsBySlug, setCommentsBySlug] = useState<Record<string, CommunityCommentDto[]>>({});
  const [commentsLoadingSlug, setCommentsLoadingSlug] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [commentBusySlug, setCommentBusySlug] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [likeBusySlug, setLikeBusySlug] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [q, setQ] = useState("");
  const [postsThisWeek, setPostsThisWeek] = useState<number | null>(null);
  const [adminOk, setAdminOk] = useState(false);

  const detailPost = detailSlug ? posts.find((p) => p.slug === detailSlug) ?? null : null;

  const pinnedPosts = useMemo(() => posts.filter((p) => p.pinnedAt), [posts]);
  const regularPosts = useMemo(() => posts.filter((p) => !p.pinnedAt), [posts]);

  const renderPostCard = (post: CommunityPostDto) => (
    <CommunityPostCard
      key={post.id}
      post={post}
      players={players}
      onOpenDetail={() => openDetail(post.slug)}
      onToggleLike={() => void toggleLike(post.slug)}
      likeBusy={likeBusySlug === post.slug}
      fifaUi
    />
  );

  useEffect(() => {
    fetch("/api/admin/session", { credentials: "include", cache: "no-store" })
      .then((res) => setAdminOk(res.ok))
      .catch(() => setAdminOk(false));
  }, []);

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

  useEffect(() => {
    fetch(`${FORUM_API}/stats`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { postsThisWeek?: number }) => {
        setPostsThisWeek(typeof d.postsThisWeek === "number" ? d.postsThisWeek : null);
      })
      .catch(() => setPostsThisWeek(null));
  }, [posts.length]);

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
      setPosts(data.posts ?? []);
    } finally {
      setLoading(false);
    }
  }, [sort, category, q]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const loadComments = useCallback(async (slug: string, force = false) => {
    if (!force && slug in commentsBySlug) return;
    setCommentsLoadingSlug(slug);
    try {
      const res = await fetch(`${FORUM_API}/posts/${encodeURIComponent(slug)}/comments`, {
        credentials: "include",
      });
      const data = (await res.json()) as { comments?: CommunityCommentDto[] };
      setCommentsBySlug((prev) => ({ ...prev, [slug]: data.comments ?? [] }));
    } finally {
      setCommentsLoadingSlug(null);
    }
  }, [commentsBySlug]);

  const openDetail = (slug: string) => {
    setDetailSlug(slug);
    void loadComments(slug);
  };

  const closeDetail = () => setDetailSlug(null);

  const submitComment = async (slug: string) => {
    const text = commentTexts[slug]?.trim();
    if (!text) return;
    if (status !== "authenticated") {
      toast.error("Pro komentář se přihlas.");
      return;
    }
    setCommentBusySlug(slug);
    try {
      const res = await fetch(`${FORUM_API}/posts/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyMd: text }),
      });
      const data = (await res.json()) as { comment?: CommunityCommentDto; error?: string };
      if (!res.ok || !data.comment) {
        toast.error(data.error ?? "Komentář se nepodařil.");
        return;
      }
      setCommentsBySlug((prev) => ({
        ...prev,
        [slug]: [...(prev[slug] ?? []), data.comment!],
      }));
      setCommentTexts((prev) => ({ ...prev, [slug]: "" }));
      setPosts((prev) =>
        prev.map((p) => (p.slug === slug ? { ...p, commentCount: p.commentCount + 1 } : p)),
      );
    } finally {
      setCommentBusySlug(null);
    }
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
            ? { ...p, likedByMe: !!data.liked, likeCount: data.likeCount ?? p.likeCount }
            : p,
        ),
      );
    } finally {
      setLikeBusySlug(null);
    }
  };

  const deletePost = async (slug: string) => {
    if (!confirm("Smazat tento příspěvek?")) return;
    const res = await fetch(`${FORUM_API}/posts/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      toast.error("Smazání selhalo.");
      return;
    }
    toast.success("Příspěvek smazán.");
    setPosts((prev) => prev.filter((p) => p.slug !== slug));
    closeDetail();
  };

  return (
    <FifaAppPage className="!p-0" fillMobile fitViewport>
      <div className="fifa-forum-page">
        <h1 className="sr-only">Fórum</h1>

        <div className="fifa-forum-layout">
          <main className="fifa-forum-feed">
            <div className="fifa-forum-feed-stage">
              <div className="fifa-forum-feed-stage__toolbar">
                <button
                  type="button"
                  onClick={() => void loadPosts()}
                  className={`${FIFA_BTN_SECONDARY} fifa-forum-stage-tool !px-2.5 !py-2`}
                  aria-label="Obnovit feed"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="fifa-forum-feed-stage__body">
                {loading && posts.length === 0 ? (
                  <div className="fifa-forum-feed-stage__column fifa-forum-feed-stage__column--fit">
                    <div className="fifa-forum-empty">
                      <Loader2 className="h-6 w-6 animate-spin text-[var(--fifa-text-muted)]" />
                    </div>
                  </div>
                ) : posts.length === 0 ? (
                  status === "authenticated" && !q.trim() && !category ? (
                    <div className="fifa-forum-feed-stage__column fifa-forum-feed-stage__column--fit">
                      <button type="button" onClick={() => setNewOpen(true)} className="fifa-forum-compose-frame">
                        <span className="fifa-forum-compose-frame__icon" aria-hidden>
                          <PenLine className="h-6 w-6" />
                        </span>
                        <span className="fifa-forum-compose-frame__label">Nový příspěvek</span>
                        <span className="fifa-forum-compose-frame__hint">Sdílej sestavu, nominaci nebo diskuzi</span>
                      </button>
                    </div>
                  ) : (
                    <div className="fifa-forum-feed-stage__column fifa-forum-feed-stage__column--fit">
                      <div className="fifa-forum-empty">
                        <MessagesSquare className="h-8 w-8 text-[var(--fifa-accent-text)]" aria-hidden />
                        <p className="mt-3 font-display text-base font-semibold text-[var(--fifa-text)]">
                          {q.trim() || category ? "Nic nenalezeno" : "Zatím žádné příspěvky"}
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="fifa-forum-feed-stage__split">
                    <section className="fifa-forum-feed-column fifa-forum-feed-column--pinned" aria-label="Připnuté příspěvky">
                      <p className="fifa-forum-feed-column__label">Připnuto</p>
                      {pinnedPosts.length === 0 ? (
                        <div className="fifa-forum-feed-column__empty">
                          <p>Žádné připnuté příspěvky</p>
                        </div>
                      ) : (
                        <ForumFeedCarousel itemCount={pinnedPosts.length} ariaLabel="Připnuté příspěvky">
                          {pinnedPosts.map(renderPostCard)}
                        </ForumFeedCarousel>
                      )}
                    </section>

                    <section className="fifa-forum-feed-column fifa-forum-feed-column--feed" aria-label="Příspěvky">
                      <p className="fifa-forum-feed-column__label">Příspěvky</p>
                      {regularPosts.length === 0 ? (
                        <div className="fifa-forum-feed-column__empty">
                          <p>Všechny příspěvky jsou připnuté</p>
                        </div>
                      ) : (
                        <ForumFeedCarousel itemCount={regularPosts.length} ariaLabel="Příspěvky">
                          {regularPosts.map(renderPostCard)}
                        </ForumFeedCarousel>
                      )}
                    </section>

                    {status === "authenticated" ? (
                      <button
                        type="button"
                        onClick={() => setNewOpen(true)}
                        className="fifa-forum-stage-fab xl:hidden"
                        aria-label="Nový příspěvek"
                      >
                        <Plus className="h-5 w-5" aria-hidden />
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </main>

          <aside className="fifa-forum-sidebar">
            <div className="fifa-forum-sidebar__sticky">
              <div className="fifa-forum-sidebar__section">
                <h2 className="fifa-forum-sidebar__heading">
                  <Search className="h-3.5 w-3.5 text-[var(--fifa-accent-text)]" aria-hidden />
                  Hledat
                </h2>
                <div className="fifa-forum-search">
                  <Search className="fifa-forum-search__icon" aria-hidden />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Hledat na fóru…"
                    className="fifa-forum-search__input fifa-forum-search__input--round"
                    aria-label="Hledat"
                  />
                </div>
              </div>

              <div className="fifa-forum-sidebar__section">
                <h2 className="fifa-forum-sidebar__heading">
                  <Clock className="h-3.5 w-3.5 text-[var(--fifa-accent-text)]" aria-hidden />
                  Řazení
                </h2>
                <div className="fifa-forum-sidebar__list">
                  {(Object.keys(COMMUNITY_SORT_LABELS) as CommunitySortMode[]).map((s) => {
                    const Icon = COMMUNITY_SORT_ICONS[s];
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSort(s)}
                        className={`fifa-forum-sidebar__item ${sort === s ? "fifa-forum-sidebar__item--active" : ""}`}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                        {COMMUNITY_SORT_LABELS[s]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="fifa-forum-sidebar__section">
                <h2 className="fifa-forum-sidebar__heading">
                  <Tags className="h-3.5 w-3.5 text-[var(--fifa-accent-text)]" aria-hidden />
                  Kategorie
                </h2>
                <div className="fifa-forum-sidebar__list">
                  <button
                    type="button"
                    onClick={() => setCategory("")}
                    className={`fifa-forum-sidebar__item ${category === "" ? "fifa-forum-sidebar__item--active" : ""}`}
                  >
                    Vše
                  </button>
                  {COMMUNITY_CATEGORY_ORDER.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`fifa-forum-sidebar__item ${category === c ? "fifa-forum-sidebar__item--active" : ""}`}
                    >
                      {COMMUNITY_CATEGORY_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>

              {communityUsersCount !== null || postsThisWeek !== null ? (
                <p className="fifa-forum-sidebar__meta">
                  {communityUsersCount !== null ? `${formatCs(communityUsersCount)} aktivních členů` : null}
                  {communityUsersCount !== null && postsThisWeek !== null ? " • " : null}
                  {postsThisWeek !== null ? `${formatCs(postsThisWeek)} příspěvků tento týden` : null}
                </p>
              ) : null}

              <div className="fifa-forum-sidebar__cta">
                {status === "authenticated" ? (
                  <button type="button" onClick={() => setNewOpen(true)} className="fifa-forum-new-post-btn">
                    <Plus className="h-4 w-4" aria-hidden />
                    Nový příspěvek
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void signIn("google", { callbackUrl: "/forum" })}
                    className={`${FIFA_BTN_SECONDARY} fifa-forum-sidebar__cta-login`}
                  >
                    Přihlásit se
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>

      </div>

      <CommunityPostDetailModal
        post={detailPost}
        players={players}
        open={!!detailSlug && !!detailPost}
        onClose={closeDetail}
        comments={detailSlug ? (commentsBySlug[detailSlug] ?? []) : []}
        commentsLoading={detailSlug ? commentsLoadingSlug === detailSlug : false}
        commentText={detailSlug ? (commentTexts[detailSlug] ?? "") : ""}
        onCommentTextChange={(v) => detailSlug && setCommentTexts((prev) => ({ ...prev, [detailSlug]: v }))}
        onSubmitComment={() => detailSlug && void submitComment(detailSlug)}
        commentBusy={detailSlug ? commentBusySlug === detailSlug : false}
        canComment={status === "authenticated"}
        canDelete={
          !!detailPost &&
          (adminOk || (!!session?.user?.id && session.user.id === detailPost.author.id))
        }
        onDelete={() => detailSlug && void deletePost(detailSlug)}
        onToggleLike={() => detailSlug && void toggleLike(detailSlug)}
        likeBusy={detailSlug ? likeBusySlug === detailSlug : false}
      />

      <NewPostModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={() => void loadPosts()}
        apiBase={FORUM_API}
        fifaUi
        players={players}
      />
    </FifaAppPage>
  );
}
