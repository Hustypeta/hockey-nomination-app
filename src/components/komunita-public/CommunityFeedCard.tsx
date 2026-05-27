"use client";

import Link from "next/link";
import { Eye, MessageCircle, ThumbsUp } from "lucide-react";
import type { CommunityPostDto } from "@/lib/community/types";

export function CommunityFeedCard({
  post,
  onOpen,
}: {
  post: CommunityPostDto;
  onOpen: () => void;
}) {
  const author = post.author.name?.trim() || "Hráč";
  const created = new Date(post.createdAt).toLocaleString("cs-CZ", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const heroAttachment = post.attachments[0]?.snapshot?.sourcePath;

  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] shadow-[0_20px_70px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-cyan-400/20"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {/* top accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      {/* “image” area */}
      <div className="relative h-28 border-b border-white/10 bg-[radial-gradient(ellipse_80%_120%_at_18%_20%,rgba(0,180,255,0.22),transparent_55%),radial-gradient(ellipse_70%_110%_at_88%_40%,rgba(255,45,85,0.12),transparent_58%)]">
        <div className="absolute inset-0 opacity-[0.07]" aria-hidden style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 10px)" }} />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/55">
              {author} · {created}
            </p>
            <p className="mt-1 line-clamp-1 text-lg font-black tracking-tight text-white">
              {post.title}
            </p>
          </div>
          {heroAttachment ? (
            <Link
              href={heroAttachment}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="hidden shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10 sm:inline-flex"
            >
              Otevřít přílohu
            </Link>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-white/70">{post.bodyMd}</p>

        {post.tags.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 6).map((t) => (
              <span
                key={t.slug}
                className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] font-semibold text-white/60"
              >
                #{t.label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between text-sm text-white/60">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <ThumbsUp className="h-4 w-4" /> {post.likeCount}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" /> {post.commentCount}
            </span>
            <span className="inline-flex items-center gap-1.5 opacity-60">
              <Eye className="h-4 w-4" /> 0
            </span>
          </div>
          <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[11px] font-bold text-cyan-200">
            skóre {post.score}
          </span>
        </div>
      </div>
    </article>
  );
}

