"use client";

import { MessageCircle, Pin, ThumbsUp } from "lucide-react";
import { COMMUNITY_CATEGORY_LABELS } from "@/lib/community/categories";
import type { CommunityPostDto } from "@/lib/community/types";
import { CommunityBody } from "@/components/komunita/CommunityBody";
import { CommunityLineupEmbed } from "@/components/komunita/CommunityLineupEmbed";
import type { Player } from "@/types";

export function CommunityPostCard({
  post,
  players,
  selected,
  onSelect,
  onToggleLike,
  likeBusy,
}: {
  post: CommunityPostDto;
  players: Player[];
  selected: boolean;
  onSelect: () => void;
  onToggleLike: () => void;
  likeBusy: boolean;
}) {
  const authorLabel = post.author.name?.trim() || "Hráč";
  return (
    <article
      className={`cursor-pointer rounded-2xl border p-4 transition ${
        selected
          ? "border-cyan-400/50 bg-cyan-950/25"
          : "border-white/10 bg-black/25 hover:border-white/20"
      }`}
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
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/50">
        {post.pinnedAt ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-200">
            <Pin className="h-3 w-3" />
            Připnuto
          </span>
        ) : null}
        <span className="rounded-full bg-white/10 px-2 py-0.5">
          {COMMUNITY_CATEGORY_LABELS[post.category]}
        </span>
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
      <h2 className="mt-2 font-sans text-lg font-bold text-white">{post.title}</h2>
      <div className="mt-2 line-clamp-3">
        <CommunityBody text={post.bodyMd} />
      </div>
      {post.tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span key={t.slug} className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] text-white/60">
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
      <div className="mt-3 flex items-center gap-4 text-sm text-white/60">
        <button
          type="button"
          disabled={likeBusy}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike();
          }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition hover:bg-white/10 ${
            post.likedByMe ? "text-rose-300" : ""
          }`}
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
