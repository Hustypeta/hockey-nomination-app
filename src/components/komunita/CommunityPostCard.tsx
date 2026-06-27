"use client";

import { MessageCircle, Pin, ThumbsUp } from "lucide-react";
import { COMMUNITY_CATEGORY_LABELS } from "@/lib/community/categories";
import type { CommunityPostDto } from "@/lib/community/types";
import { CommunityBody } from "@/components/komunita/CommunityBody";
import { CommunityLineupEmbed } from "@/components/komunita/CommunityLineupEmbed";
import { FIFA_BADGE, FIFA_META } from "@/lib/fifa/fifaUiClasses";
import type { Player } from "@/types";

export function CommunityPostCard({
  post,
  players,
  selected,
  onSelect,
  onToggleLike,
  likeBusy,
  fifaUi = false,
}: {
  post: CommunityPostDto;
  players: Player[];
  selected: boolean;
  onSelect: () => void;
  onToggleLike: () => void;
  likeBusy: boolean;
  fifaUi?: boolean;
}) {
  const authorLabel = post.author.name?.trim() || "Hráč";

  const shellClass = fifaUi
    ? `fifa-forum-post ${selected ? "fifa-forum-post--selected" : ""}`
    : `cursor-pointer rounded-2xl border p-4 transition ${
        selected
          ? "border-cyan-400/50 bg-cyan-950/25"
          : "border-white/10 bg-black/25 hover:border-white/20"
      }`;

  const metaClass = fifaUi ? FIFA_META : "text-[11px] text-white/50";
  const titleClass = fifaUi
    ? "mt-2 font-sans text-lg font-bold text-[var(--fifa-text)]"
    : "mt-2 font-sans text-lg font-bold text-white";
  const tagClass = fifaUi
    ? FIFA_BADGE
    : "rounded-full bg-white/10 px-2 py-0.5";
  const pinClass = fifaUi
    ? "inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-300"
    : "inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-200";
  const hashTagClass = fifaUi
    ? "rounded-full border border-[var(--fifa-border)] bg-[var(--fifa-bg-surface)] px-2 py-0.5 text-[11px] text-[var(--fifa-text-muted)]"
    : "rounded-full bg-white/8 px-2 py-0.5 text-[11px] text-white/60";
  const actionsClass = fifaUi
    ? "mt-3 flex items-center gap-4 text-sm text-[var(--fifa-text-muted)]"
    : "mt-3 flex items-center gap-4 text-sm text-white/60";

  return (
    <article
      className={shellClass}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={`flex flex-wrap items-center gap-2 ${metaClass}`}>
        {post.pinnedAt ? (
          <span className={pinClass}>
            <Pin className="h-3 w-3" />
            Připnuto
          </span>
        ) : null}
        <span className={tagClass}>{COMMUNITY_CATEGORY_LABELS[post.category]}</span>
        <span>{authorLabel}</span>
        <span>·</span>
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleString("cs-CZ", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
      <h2 className={titleClass}>{post.title}</h2>
      <div className="mt-2 line-clamp-3">
        <CommunityBody text={post.bodyMd} />
      </div>
      {post.tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span key={t.slug} className={hashTagClass}>
              #{t.label}
            </span>
          ))}
        </div>
      ) : null}
      {post.attachments[0] ? (
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          <CommunityLineupEmbed snapshot={post.attachments[0].snapshot} players={players} />
        </div>
      ) : null}
      <div className={actionsClass}>
        <button
          type="button"
          disabled={likeBusy}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike();
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition ${
            fifaUi ? "hover:bg-[var(--fifa-bg-hover)]" : "hover:bg-white/10"
          } ${post.likedByMe ? "text-rose-400" : ""}`}
        >
          <ThumbsUp className={`h-4 w-4 ${post.likedByMe ? "fill-current" : ""}`} />
          {post.likeCount}
        </button>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4" />
          {post.commentCount}
        </span>
      </div>
    </article>
  );
}
