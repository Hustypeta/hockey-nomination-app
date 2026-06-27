"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, MessagesSquare } from "lucide-react";
import { COMMUNITY_CATEGORY_LABELS } from "@/lib/community/categories";
import { communityPostExcerpt } from "@/lib/community/excerpt";
import type { CommunityPostDto } from "@/lib/community/types";
import { FIFA_LINK } from "@/lib/fifa/fifaUiClasses";

const ROTATE_MS = 8000;
const HOME_FORUM_LIMIT = 5;

function authorLabel(post: CommunityPostDto): string {
  return post.author.name?.trim() || "Uživatel Lineup";
}

export function FifaHomeForumPostsCard() {
  const [posts, setPosts] = useState<CommunityPostDto[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/forum/posts?limit=${HOME_FORUM_LIMIT}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load"))))
      .then((data: { posts?: CommunityPostDto[] }) => {
        if (cancelled) return;
        setPosts(data.posts ?? []);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (posts.length < 2) return;
    let swap: ReturnType<typeof setTimeout> | undefined;
    const t = setInterval(() => {
      setFade(false);
      swap = setTimeout(() => {
        setIndex((i) => (i + 1) % posts.length);
        setFade(true);
      }, 280);
    }, ROTATE_MS);
    return () => {
      clearInterval(t);
      if (swap) clearTimeout(swap);
    };
  }, [posts.length]);

  const post = posts[index];
  const showDots = posts.length > 1;

  const pickIndex = (i: number) => {
    if (i === index) return;
    setFade(false);
    setTimeout(() => {
      setIndex(i);
      setFade(true);
    }, 200);
  };

  return (
    <div className="fifa-card fifa-card--interactive relative flex h-full min-h-0 flex-col overflow-hidden">
      <MessagesSquare className="fifa-card-watermark h-24 w-24" aria-hidden />
      <div className="fifa-card-header relative z-10">
        <p className="fifa-kicker flex items-center gap-2">
          <span className="fifa-icon-chip">
            <MessagesSquare className="h-3.5 w-3.5" aria-hidden />
          </span>
          Fórum
        </p>
        <Link href="/forum" className="fifa-btn-ghost text-[var(--fifa-accent-text)]">
          Vše
        </Link>
      </div>

      <div className="fifa-card-body relative flex min-h-0 flex-col">
        {loading ? (
          <div className="flex flex-1 items-center justify-center p-4">
            <p className="fifa-meta">Načítám…</p>
          </div>
        ) : !post ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
            <MessagesSquare className="h-6 w-6 text-[var(--fifa-text-muted)]" aria-hidden />
            <p className="fifa-meta leading-snug">Zatím žádné příspěvky.</p>
            <Link href="/forum" className={`text-[11px] ${FIFA_LINK}`}>
              Přejít na fórum
            </Link>
          </div>
        ) : (
          <Link
            href={`/forum?post=${encodeURIComponent(post.slug)}`}
            className={`flex h-full min-h-0 flex-col justify-between overflow-hidden p-3 transition-opacity duration-300 lg:p-3.5 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="min-h-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="fifa-meta truncate font-medium uppercase tracking-wide">
                  {COMMUNITY_CATEGORY_LABELS[post.category]}
                </span>
                {showDots ? (
                  <div className="flex shrink-0 gap-1" onClick={(e) => e.preventDefault()}>
                    {posts.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          pickIndex(i);
                        }}
                        className={`rounded-full transition-all ${
                          i === index ? "h-1 w-2.5 bg-[var(--fifa-accent)]" : "h-1 w-1 bg-[var(--fifa-border-strong)]"
                        }`}
                        aria-label={`Příspěvek ${i + 1}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <h3 className="font-display line-clamp-2 text-sm font-semibold leading-snug text-[var(--fifa-text)]">
                {post.title}
              </h3>
              <p className="line-clamp-2 text-[11px] leading-relaxed text-[var(--fifa-text-secondary)]">
                {communityPostExcerpt(post.bodyMd, 100)}
              </p>
            </div>

            <div className="mt-3 flex shrink-0 items-center justify-between gap-2 border-t border-[var(--fifa-border)] pt-2.5">
              <span className="fifa-meta truncate">{authorLabel(post)}</span>
              <span className="fifa-meta flex shrink-0 items-center gap-2">
                <span className="inline-flex items-center gap-0.5">
                  <Heart className="h-2.5 w-2.5" aria-hidden />
                  {post.likeCount}
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <MessageCircle className="h-2.5 w-2.5" aria-hidden />
                  {post.commentCount}
                </span>
              </span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
