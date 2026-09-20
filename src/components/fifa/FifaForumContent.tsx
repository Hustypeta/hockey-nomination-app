"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clock,
  Compass,
  Heart,
  LayoutGrid,
  Loader2,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  PenLine,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Tags,
  TrendingUp,
  Users,
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
import type {
  CommunityCommentDto,
  CommunityMemberDto,
  CommunityPostDto,
} from "@/lib/community/types";
import { authorInitials, formatRelativeTime, previewCommentText } from "@/lib/community/display";
import { initJerseyNameDisambiguation } from "@/lib/jerseyDisplayName";
import { useContestStats } from "@/hooks/useContestStats";
import { FIFA_BTN_SECONDARY } from "@/lib/fifa/fifaUiClasses";
import type { Player } from "@/types";

const FORUM_API = "/api/forum";

type ForumMobilePane = "pinned" | "wall" | "explore";

const MOBILE_SORT_LABELS: Record<CommunitySortMode, string> = {
  new: "Nové",
  top: "Top",
};

function formatCs(n: number): string {
  return new Intl.NumberFormat("cs-CZ").format(n);
}

export function FifaForumContent() {
  const { data: session, status } = useSession();
  const { communityUsersCount } = useContestStats();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPostSlug = searchParams.get("post");
  const dismissedPostSlugRef = useRef<string | null>(null);

  const [posts, setPosts] = useState<CommunityPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<CommunitySortMode>("new");
  const [category, setCategory] = useState<CommunityPostCategory | "">("");
  const [detailSlug, setDetailSlug] = useState<string | null>(null);
  const [commentsBySlug, setCommentsBySlug] = useState<Record<string, CommunityCommentDto[]>>({});
  const [commentsLoadingSlug, setCommentsLoadingSlug] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [replyToBySlug, setReplyToBySlug] = useState<Record<string, string | null>>({});
  const [commentBusySlug, setCommentBusySlug] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [likeBusySlug, setLikeBusySlug] = useState<string | null>(null);
  const [commentLikeBusyId, setCommentLikeBusyId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [q, setQ] = useState("");
  const [postsThisWeek, setPostsThisWeek] = useState<number | null>(null);
  const [popularPosts, setPopularPosts] = useState<CommunityPostDto[]>([]);
  const [communityMembers, setCommunityMembers] = useState<CommunityMemberDto[]>([]);
  const [adminOk, setAdminOk] = useState(false);
  const [mobilePane, setMobilePane] = useState<ForumMobilePane>("wall");
  const mobilePaneReadyRef = useRef(false);

  const detailPost = detailSlug ? posts.find((p) => p.slug === detailSlug) ?? null : null;

  const pinnedPosts = useMemo(() => posts.filter((p) => p.pinnedAt), [posts]);
  const regularPosts = useMemo(() => posts.filter((p) => !p.pinnedAt), [posts]);
  const forumActivityVersion = posts.reduce(
    (total, post) => total + post.commentCount,
    posts.length,
  );

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

  useEffect(() => {
    fetch(`${FORUM_API}/posts?window=week&limit=3`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { posts?: CommunityPostDto[] }) => {
        setPopularPosts((data.posts ?? []).slice(0, 3));
      })
      .catch(() => setPopularPosts([]));
  }, [posts.length]);

  useEffect(() => {
    fetch(`${FORUM_API}/members`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { members?: CommunityMemberDto[] }) => {
        setCommunityMembers(data.members ?? []);
      })
      .catch(() => setCommunityMembers([]));
  }, [forumActivityVersion]);

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

  useEffect(() => {
    if (loading || mobilePaneReadyRef.current) return;
    mobilePaneReadyRef.current = true;
    if (regularPosts.length === 0 && pinnedPosts.length > 0) {
      setMobilePane("pinned");
    }
  }, [loading, pinnedPosts.length, regularPosts.length]);

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

  useEffect(() => {
    if (!requestedPostSlug) {
      dismissedPostSlugRef.current = null;
      return;
    }
    if (detailSlug === requestedPostSlug) return;
    if (dismissedPostSlugRef.current === requestedPostSlug) return;

    const existing = posts.find((post) => post.slug === requestedPostSlug);
    if (existing) {
      setDetailSlug(existing.slug);
      void loadComments(existing.slug);
      return;
    }

    let cancelled = false;
    fetch(`${FORUM_API}/posts/${encodeURIComponent(requestedPostSlug)}`, {
      cache: "no-store",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Příspěvek nenalezen.");
        return (await res.json()) as { post?: CommunityPostDto };
      })
      .then(({ post }) => {
        if (cancelled || !post) return;
        if (dismissedPostSlugRef.current === post.slug) return;
        setPosts((current) =>
          current.some((item) => item.id === post.id) ? current : [post, ...current],
        );
        setDetailSlug(post.slug);
        void loadComments(post.slug);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Odkazovaný příspěvek už není dostupný.");
          router.replace("/forum", { scroll: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [detailSlug, loadComments, posts, requestedPostSlug, router]);

  const openDetail = (slug: string) => {
    dismissedPostSlugRef.current = null;
    setDetailSlug(slug);
    void loadComments(slug);
    router.replace(`/forum?post=${encodeURIComponent(slug)}`, { scroll: false });
  };

  const closeDetail = () => {
    dismissedPostSlugRef.current = requestedPostSlug ?? detailSlug;
    setDetailSlug(null);
    router.replace("/forum", { scroll: false });
  };

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
        body: JSON.stringify({
          bodyMd: text,
          parentId: replyToBySlug[slug] ?? null,
        }),
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
      setReplyToBySlug((prev) => ({ ...prev, [slug]: null }));
      setPosts((prev) =>
        prev.map((p) => {
          if (p.slug !== slug) return p;
          const previewText = previewCommentText(data.comment!.bodyMd);
          const nextPreview = previewText
            ? [
                ...(p.previewComments ?? []),
                {
                  id: data.comment!.id,
                  authorName: data.comment!.author.displayName,
                  text: previewText,
                },
              ].slice(-2)
            : p.previewComments;
          return { ...p, commentCount: p.commentCount + 1, previewComments: nextPreview };
        }),
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

  const toggleCommentLike = async (slug: string, commentId: string) => {
    if (status !== "authenticated") {
      toast.error("Pro lajk se přihlas Google účtem.");
      return;
    }
    setCommentLikeBusyId(commentId);
    try {
      const res = await fetch(
        `${FORUM_API}/posts/${encodeURIComponent(slug)}/comments/${encodeURIComponent(commentId)}/like`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = (await res.json()) as { liked?: boolean; likeCount?: number; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Lajk selhal.");
        return;
      }
      setCommentsBySlug((prev) => ({
        ...prev,
        [slug]: (prev[slug] ?? []).map((c) =>
          c.id === commentId
            ? { ...c, likedByMe: !!data.liked, likeCount: data.likeCount ?? c.likeCount }
            : c,
        ),
      }));
    } finally {
      setCommentLikeBusyId(null);
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

  const openCompose = () => {
    if (status === "authenticated") {
      setNewOpen(true);
      return;
    }
    void signIn("google", { callbackUrl: "/forum" });
  };

  const renderDiscoverSections = () => (
    <>
      <div className="fifa-forum-banner__block">
        <div className="fifa-forum-sidebar__section-head">
          <h2 className="fifa-forum-sidebar__heading">
            <Search className="fifa-forum-sidebar__heading-icon" aria-hidden />
            Hledat
          </h2>
          <button
            type="button"
            onClick={() => void loadPosts()}
            className="fifa-forum-sidebar__refresh"
            aria-label="Obnovit příspěvky"
            title="Obnovit příspěvky"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
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

      <div className="fifa-forum-banner__block">
        <h2 className="fifa-forum-sidebar__heading">
          <TrendingUp className="fifa-forum-sidebar__heading-icon" aria-hidden />
          Populární příspěvky
        </h2>
        {popularPosts.length > 0 ? (
          <div className="fifa-forum-sidebar__popular">
            {popularPosts.map((post, index) => (
              <button
                key={post.id}
                type="button"
                className="fifa-forum-sidebar__popular-item"
                onClick={() => {
                  setPosts((current) =>
                    current.some((item) => item.id === post.id)
                      ? current
                      : [post, ...current],
                  );
                  openDetail(post.slug);
                }}
              >
                <span className="fifa-forum-sidebar__popular-rank">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="fifa-forum-sidebar__popular-title">{post.title}</span>
                  <span className="fifa-forum-sidebar__popular-meta">
                    <span>
                      <Heart className="h-3 w-3" aria-hidden />
                      {post.likeCount}
                    </span>
                    <span>
                      <MessageCircle className="h-3 w-3" aria-hidden />
                      {post.commentCount}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="fifa-forum-sidebar__empty">Zatím žádné příspěvky tento týden</p>
        )}
      </div>

      <div className="fifa-forum-banner__block fifa-forum-members">
        <div className="fifa-forum-members__head">
          <span>
            <Users className="fifa-forum-sidebar__heading-icon" aria-hidden />
            Členové
          </span>
          {communityMembers.length > 0 ? (
            <strong>{communityMembers.filter((member) => member.active).length}</strong>
          ) : null}
        </div>
        {communityMembers.length > 0 ? (
          <ul className="fifa-forum-members__list">
            {communityMembers.map((member) => (
              <li className="fifa-forum-members__item" key={member.id}>
                <span className="fifa-forum-members__avatar" aria-hidden>
                  {member.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.image} alt="" />
                  ) : (
                    authorInitials(member.displayName)
                  )}
                  <span
                    className={`fifa-forum-members__status ${
                      member.active
                        ? "fifa-forum-members__status--active"
                        : "fifa-forum-members__status--inactive"
                    }`}
                  />
                </span>
                <span className="fifa-forum-members__identity">
                  <strong className={member.isStaff ? "fifa-forum-members__staff" : ""}>
                    {member.displayName}
                  </strong>
                  <time dateTime={member.lastActiveAt}>
                    {member.active ? "aktivní" : formatRelativeTime(member.lastActiveAt)}
                  </time>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="fifa-forum-sidebar__empty">Zatím žádní členové</p>
        )}
      </div>
      {communityUsersCount !== null || postsThisWeek !== null ? (
        <div className="fifa-forum-banner__block fifa-forum-members__stats">
          {communityUsersCount !== null ? (
            <span>
              <strong>{formatCs(communityUsersCount)}</strong>
              v komunitě
            </span>
          ) : null}
          {postsThisWeek !== null ? (
            <span>
              <strong>{formatCs(postsThisWeek)}</strong>
              příspěvků tento týden
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  return (
    <FifaAppPage className="!p-0" fillMobile fitViewport>
      <div className="fifa-forum-page" data-mobile-pane={mobilePane}>
        <h1 className="sr-only">Fórum</h1>

        <div className="fifa-forum-layout">
          <main className="fifa-forum-feed">
            <div className="fifa-forum-mobile-chrome">
              <div className="fifa-forum-mobile-switcher" role="tablist" aria-label="Sekce fóra">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobilePane === "pinned"}
                  className={`fifa-forum-mobile-switcher__tab${
                    mobilePane === "pinned" ? " fifa-forum-mobile-switcher__tab--active" : ""
                  }`}
                  onClick={() => setMobilePane("pinned")}
                >
                  <Pin className="fifa-forum-mobile-switcher__icon" aria-hidden />
                  Připnuté
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobilePane === "wall"}
                  className={`fifa-forum-mobile-switcher__tab${
                    mobilePane === "wall" ? " fifa-forum-mobile-switcher__tab--active" : ""
                  }`}
                  onClick={() => setMobilePane("wall")}
                >
                  <Newspaper className="fifa-forum-mobile-switcher__icon" aria-hidden />
                  Zeď
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mobilePane === "explore"}
                  className={`fifa-forum-mobile-switcher__tab${
                    mobilePane === "explore" ? " fifa-forum-mobile-switcher__tab--active" : ""
                  }`}
                  onClick={() => setMobilePane("explore")}
                >
                  <Compass className="fifa-forum-mobile-switcher__icon" aria-hidden />
                  Komunita
                </button>
              </div>
              <button
                type="button"
                className="fifa-forum-mobile-compose"
                onClick={openCompose}
                aria-label={status === "authenticated" ? "Nový příspěvek" : "Přihlásit se a přidat příspěvek"}
              >
                <Plus className="fifa-forum-mobile-compose__icon" aria-hidden />
              </button>
            </div>

            {mobilePane !== "explore" ? (
              <div className="fifa-forum-mobile-filters">
                <div className="fifa-forum-mobile-filters__group" aria-label="Řazení">
                  {(Object.keys(COMMUNITY_SORT_LABELS) as CommunitySortMode[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSort(s)}
                      className={`fifa-forum-mobile-filters__chip${
                        sort === s ? " fifa-forum-mobile-filters__chip--active" : ""
                      }`}
                    >
                      {MOBILE_SORT_LABELS[s]}
                    </button>
                  ))}
                </div>
                <span className="fifa-forum-mobile-filters__rule" aria-hidden />
                <div className="fifa-forum-mobile-filters__group" aria-label="Kategorie">
                  <button
                    type="button"
                    onClick={() => setCategory("")}
                    className={`fifa-forum-mobile-filters__chip${
                      category === "" ? " fifa-forum-mobile-filters__chip--active" : ""
                    }`}
                  >
                    Vše
                  </button>
                  {COMMUNITY_CATEGORY_ORDER.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`fifa-forum-mobile-filters__chip${
                        category === c ? " fifa-forum-mobile-filters__chip--active" : ""
                      }`}
                    >
                      {COMMUNITY_CATEGORY_LABELS[c]}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void loadPosts()}
                  className="fifa-forum-mobile-filters__refresh"
                  aria-label="Obnovit feed"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            ) : null}

            <div className="fifa-forum-feed-stage">
              <div className="fifa-forum-feed-stage__toolbar lg:hidden">
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
                <section className="fifa-forum-mobile-explore" aria-label="Hledat a komunita">
                  {renderDiscoverSections()}
                  <div className="fifa-forum-mobile-explore__cta">
                    <button
                      type="button"
                      onClick={() => router.push("/zapasy/sestava")}
                      className="fifa-forum-sidebar__editor-btn"
                    >
                      <LayoutGrid className="fifa-forum-sidebar__cta-icon" aria-hidden />
                      Editor sestavy
                    </button>
                  </div>
                </section>

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
                        <ForumFeedCarousel
                          itemCount={pinnedPosts.length}
                          ariaLabel="Připnuté příspěvky"
                          arrowsOnly
                        >
                          {pinnedPosts.map(renderPostCard)}
                        </ForumFeedCarousel>
                      )}
                    </section>

                    <section className="fifa-forum-feed-column fifa-forum-feed-column--feed" aria-label="Příspěvky">
                      <p className="fifa-forum-feed-column__label">Zeď</p>
                      {regularPosts.length === 0 ? (
                        <div className="fifa-forum-feed-column__empty">
                          <p>Všechny příspěvky jsou připnuté</p>
                          <button
                            type="button"
                            className="fifa-forum-mobile-empty-link"
                            onClick={() => setMobilePane("pinned")}
                          >
                            Zobrazit připnuté
                          </button>
                        </div>
                      ) : (
                        <div className="fifa-forum-wall" role="feed" aria-label="Příspěvky">
                          {regularPosts.map(renderPostCard)}
                        </div>
                      )}
                    </section>
                  </div>
                )}
              </div>
            </div>
          </main>

          <aside className="fifa-forum-banners" aria-label="Nástroje fóra">
            <section className="fifa-forum-banner fifa-forum-banner--compose" aria-label="Řazení a publikace">
              <div className="fifa-forum-banner__block fifa-forum-banner__block--sort">
                <h2 className="fifa-forum-sidebar__heading">
                  <Clock className="fifa-forum-sidebar__heading-icon" aria-hidden />
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
                        <Icon className="fifa-forum-sidebar__item-icon" aria-hidden />
                        {COMMUNITY_SORT_LABELS[s]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="fifa-forum-banner__block">
                <h2 className="fifa-forum-sidebar__heading">
                  <Tags className="fifa-forum-sidebar__heading-icon" aria-hidden />
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

              <div className="fifa-forum-banner__cta">
                <button
                  type="button"
                  onClick={() => router.push("/zapasy/sestava")}
                  className="fifa-forum-sidebar__editor-btn"
                >
                  <LayoutGrid className="fifa-forum-sidebar__cta-icon" aria-hidden />
                  Editor sestavy
                </button>
                {status === "authenticated" ? (
                  <button type="button" onClick={() => setNewOpen(true)} className="fifa-forum-new-post-btn">
                    <Plus className="fifa-forum-sidebar__cta-icon" aria-hidden />
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
            </section>

            <section className="fifa-forum-banner fifa-forum-banner--discover" aria-label="Hledat a komunita">
              {renderDiscoverSections()}
            </section>
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
        replyToId={detailSlug ? (replyToBySlug[detailSlug] ?? null) : null}
        onReply={(commentId) => {
          if (!detailSlug) return;
          setReplyToBySlug((prev) => ({ ...prev, [detailSlug]: commentId }));
        }}
        onCancelReply={() => {
          if (!detailSlug) return;
          setReplyToBySlug((prev) => ({ ...prev, [detailSlug]: null }));
        }}
        canDelete={
          !!detailPost &&
          (adminOk || (!!session?.user?.id && session.user.id === detailPost.author.id))
        }
        onDelete={() => detailSlug && void deletePost(detailSlug)}
        onToggleLike={() => detailSlug && void toggleLike(detailSlug)}
        likeBusy={detailSlug ? likeBusySlug === detailSlug : false}
        onToggleCommentLike={(commentId) => detailSlug && void toggleCommentLike(detailSlug, commentId)}
        commentLikeBusyId={commentLikeBusyId}
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
