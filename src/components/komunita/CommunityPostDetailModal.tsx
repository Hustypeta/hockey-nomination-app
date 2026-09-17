"use client";

import { Heart, Loader2, MessageCircle, Trash2, X } from "lucide-react";
import { COMMUNITY_CATEGORY_LABELS } from "@/lib/community/categories";
import { authorInitials, formatRelativeTime } from "@/lib/community/display";
import type { CommunityCommentDto, CommunityPostDto } from "@/lib/community/types";
import { CommunityBody } from "@/components/komunita/CommunityBody";
import { CommunityLineupEmbed } from "@/components/komunita/CommunityLineupEmbed";
import { CommunityPostComments } from "@/components/komunita/CommunityPostComments";
import { CommunityPostMediaFrame } from "@/components/komunita/CommunityPostMediaFrame";
import type { Player } from "@/types";

export function CommunityPostDetailModal({
  post,
  players,
  open,
  onClose,
  comments,
  commentsLoading,
  commentText,
  onCommentTextChange,
  onSubmitComment,
  commentBusy,
  canComment,
  replyToId,
  onReply,
  onCancelReply,
  canDelete,
  onDelete,
  onToggleLike,
  likeBusy,
  onToggleCommentLike,
  commentLikeBusyId,
}: {
  post: CommunityPostDto | null;
  players: Player[];
  open: boolean;
  onClose: () => void;
  comments: CommunityCommentDto[];
  commentsLoading: boolean;
  commentText: string;
  onCommentTextChange: (value: string) => void;
  onSubmitComment: () => void;
  commentBusy: boolean;
  canComment: boolean;
  replyToId: string | null;
  onReply: (commentId: string) => void;
  onCancelReply: () => void;
  canDelete: boolean;
  onDelete: () => void;
  onToggleLike: () => void;
  likeBusy: boolean;
  onToggleCommentLike: (commentId: string) => void;
  commentLikeBusyId: string | null;
}) {
  if (!open || !post) return null;

  const authorLabel = post.author.displayName;
  const isTextOnly = post.attachments.length === 0;

  return (
    <div
      className="fifa-forum-detail-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div className="fifa-forum-detail-modal" role="dialog" aria-modal aria-labelledby="forum-detail-title">
        <div className="fifa-forum-detail-modal__head">
          <span className="font-semibold text-[var(--fifa-text)]">Detail příspěvku</span>
          <div className="flex items-center gap-2">
            {canDelete ? (
              <button type="button" onClick={onDelete} className="fifa-forum-detail-modal__delete" aria-label="Smazat">
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
            <button type="button" onClick={onClose} className="fifa-forum-detail-modal__close" aria-label="Zavřít">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="fifa-forum-detail-modal__body">
          <div className="flex items-center gap-3">
            {post.author.isStaff || post.isStaffPost ? null : (
              <div className="fifa-forum-avatar fifa-forum-avatar--lg" aria-hidden>
                {post.author.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  authorInitials(authorLabel)
                )}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {post.author.isStaff || post.isStaffPost ? (
                  <span className="fifa-forum-chip fifa-forum-chip--staff">Admin</span>
                ) : (
                  <p className="font-semibold text-lg text-[var(--fifa-text)]">{authorLabel}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--fifa-text-muted)]">
                <time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt)}</time>
                <span className="fifa-forum-chip">{COMMUNITY_CATEGORY_LABELS[post.category]}</span>
              </div>
            </div>
          </div>

          {isTextOnly ? (
            <>
              <h2 id="forum-detail-title" className="sr-only">
                {post.title}
              </h2>
              <div className="fifa-forum-detail-text-slot mt-4">
                <CommunityPostMediaFrame post={post} players={players} />
              </div>
            </>
          ) : (
            <>
              <h2 id="forum-detail-title" className="fifa-forum-detail-modal__title">
                {post.title}
              </h2>

              <CommunityBody
                text={post.bodyMd}
                className="fifa-forum-detail-modal__body-text mt-4 text-sm leading-relaxed text-[var(--fifa-text-secondary)]"
              />

              {post.attachments.map((a) => (
                <div key={a.id} className="fifa-forum-detail-attachment-slot mt-4">
                  <CommunityLineupEmbed snapshot={a.snapshot} players={players} variant="featured" />
                </div>
              ))}
            </>
          )}

          {post.tags.length > 0 ? (
            <div className="fifa-forum-feed-card__tags mt-4">
              {post.tags.map((t) => (
                <span key={t.slug} className="fifa-forum-tag">
                  #{t.label}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-5 flex items-center gap-4 border-t border-[var(--fifa-border)] pt-4">
            <button
              type="button"
              disabled={likeBusy}
              onClick={onToggleLike}
              className={`fifa-forum-action ${post.likedByMe ? "fifa-forum-action--liked" : ""}`}
            >
              <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-current" : ""}`} aria-hidden />
              <span>{post.likeCount}</span>
            </button>
            <span className="text-sm text-[var(--fifa-text-muted)]">
              {post.commentCount} {post.commentCount === 1 ? "komentář" : post.commentCount < 5 ? "komentáře" : "komentářů"}
            </span>
          </div>
        </div>

        <div className="fifa-forum-detail-modal__comments">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--fifa-text-secondary)]">
            <MessageCircle className="h-4 w-4" aria-hidden />
            Komentáře
            <span className="text-[var(--fifa-accent-text)]">({post.commentCount})</span>
          </p>

          {commentsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--fifa-text-muted)]" />
            </div>
          ) : (
            <CommunityPostComments
              comments={comments}
              loading={false}
              commentText={commentText}
              onCommentTextChange={onCommentTextChange}
              onSubmitComment={onSubmitComment}
              commentBusy={commentBusy}
              showCompose={canComment}
              replyToId={replyToId}
              onReply={onReply}
              onCancelReply={onCancelReply}
              onToggleLike={onToggleCommentLike}
              likeBusyId={commentLikeBusyId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
