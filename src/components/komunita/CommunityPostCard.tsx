"use client";

import { Clock, Heart, MessageCircle, Pin } from "lucide-react";
import { COMMUNITY_CATEGORY_LABELS } from "@/lib/community/categories";
import { authorInitials, formatRelativeTime } from "@/lib/community/display";
import type { CommunityPostDto } from "@/lib/community/types";
import { CommunityBody } from "@/components/komunita/CommunityBody";
import { CommunityPostMediaFrame } from "@/components/komunita/CommunityPostMediaFrame";
import type { Player } from "@/types";

export function CommunityPostCard({
  post,
  players,
  onOpenDetail,
  onToggleLike,
  likeBusy,
  fifaUi = false,
  onSelect,
}: {
  post: CommunityPostDto;
  players: Player[];
  onOpenDetail?: () => void;
  onToggleLike: () => void;
  likeBusy: boolean;
  fifaUi?: boolean;
  /** @deprecated use onOpenDetail */
  selected?: boolean;
  onSelect?: () => void;
  commentsExpanded?: boolean;
}) {
  const authorLabel = post.author.displayName;
  const open = onOpenDetail ?? onSelect ?? (() => {});

  if (fifaUi) {
    return (
      <article id={`post-${post.slug}`} className="fifa-forum-post-card">
        <header className="fifa-forum-post-card__header">
          <div className="fifa-forum-post-card__author-row">
            {post.author.isStaff || post.isStaffPost ? null : (
              <div className="fifa-forum-avatar" aria-hidden>
                {post.author.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  authorInitials(authorLabel)
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                {post.author.isStaff || post.isStaffPost ? (
                  <span className="fifa-forum-chip fifa-forum-chip--staff">Admin</span>
                ) : (
                  <span className="truncate font-semibold text-[var(--fifa-text)]">{authorLabel}</span>
                )}
                {post.pinnedAt ? (
                  <span className="fifa-forum-chip fifa-forum-chip--pin">
                    <Pin className="h-2.5 w-2.5" aria-hidden />
                    Připnuto
                  </span>
                ) : null}
              </div>
              <time className="text-xs text-[var(--fifa-text-muted)]" dateTime={post.createdAt}>
                {formatRelativeTime(post.createdAt)}
              </time>
            </div>
          </div>
          <span className="fifa-forum-post-card__category">{COMMUNITY_CATEGORY_LABELS[post.category]}</span>
        </header>

        <button type="button" onClick={open} className="fifa-forum-post-card__frame-btn" aria-label={`Otevřít příspěvek: ${post.title}`}>
          <CommunityPostMediaFrame post={post} players={players} />
        </button>

        <footer className="fifa-forum-post-card__footer">
          <div className="fifa-forum-post-card__actions">
            <button
              type="button"
              disabled={likeBusy}
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike();
              }}
              className={`fifa-forum-post-card__action ${post.likedByMe ? "fifa-forum-post-card__action--liked" : ""}`}
              aria-label={`Lajk (${post.likeCount})`}
            >
              <Heart className={`h-6 w-6 ${post.likedByMe ? "fill-current" : ""}`} aria-hidden />
            </button>
            <button
              type="button"
              onClick={open}
              className="fifa-forum-post-card__action"
              aria-label={`Komentáře (${post.commentCount})`}
            >
              <MessageCircle className="h-6 w-6" aria-hidden />
            </button>
          </div>

          <p className="fifa-forum-post-card__counts">
            <span>{post.likeCount} lajků</span>
            {post.commentCount > 0 ? <span>{post.commentCount} komentářů</span> : null}
          </p>

          <button type="button" onClick={open} className="fifa-forum-post-card__caption">
            <span className="fifa-forum-post-card__caption-author">{authorLabel}</span>
            <span className="fifa-forum-post-card__caption-title">{post.title}</span>
            <span className="fifa-forum-post-card__caption-more">… více</span>
          </button>
        </footer>
      </article>
    );
  }

  const shellClass = "cursor-pointer rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-white/20";
  return (
    <article className={shellClass} onClick={open} role="button" tabIndex={0}>
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/50">
        <span className="rounded-full bg-white/10 px-2 py-0.5">{COMMUNITY_CATEGORY_LABELS[post.category]}</span>
        <span>{authorLabel}</span>
      </div>
      <h2 className="mt-2 font-sans text-lg font-bold text-white">{post.title}</h2>
      <div className="mt-2 line-clamp-3">
        <CommunityBody text={post.bodyMd} />
      </div>
    </article>
  );
}

export const COMMUNITY_SORT_ICONS = {
  new: Clock,
  top: Heart,
} as const;
