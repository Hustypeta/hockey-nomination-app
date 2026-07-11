"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pin, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import type { CommunityCommentDto, CommunityPostDto } from "@/lib/community/types";
import { CommunityBody } from "@/components/komunita/CommunityBody";
import { CommunityLineupEmbed } from "@/components/komunita/CommunityLineupEmbed";
import { authorInitials, formatRelativeTime } from "@/lib/community/display";
import { FIFA_BTN_PRIMARY, FIFA_BTN_SECONDARY, FIFA_INPUT } from "@/lib/fifa/fifaUiClasses";
import type { Player } from "@/types";

const ADMIN_API = "/api/admin/komunita";

export function PostDetailPanel({
  slug,
  players,
  onPostUpdated,
  onDeleted,
  fifaUi = false,
  apiBase = ADMIN_API,
  allowPin = true,
  allowDeleteAny = false,
}: {
  slug: string;
  players: Player[];
  onPostUpdated: (post: CommunityPostDto) => void;
  onDeleted: () => void;
  fifaUi?: boolean;
  apiBase?: string;
  allowPin?: boolean;
  allowDeleteAny?: boolean;
}) {
  const { data: session } = useSession();
  const [post, setPost] = useState<CommunityPostDto | null>(null);
  const [comments, setComments] = useState<CommunityCommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`${apiBase}/posts/${encodeURIComponent(slug)}`, { credentials: "include" }),
        fetch(`${apiBase}/posts/${encodeURIComponent(slug)}/comments`, { credentials: "include" }),
      ]);
      const pData = (await pRes.json()) as { post?: CommunityPostDto; error?: string };
      const cData = (await cRes.json()) as { comments?: CommunityCommentDto[] };
      if (!pRes.ok || !pData.post) {
        toast.error(pData.error ?? "Příspěvek nenalezen.");
        setPost(null);
        return;
      }
      setPost(pData.post);
      onPostUpdated(pData.post);
      setComments(cData.comments ?? []);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync list only after explicit actions
  }, [slug, apiBase]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setCommentBusy(true);
    try {
      const res = await fetch(`${apiBase}/posts/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyMd: commentText }),
      });
      const data = (await res.json()) as { comment?: CommunityCommentDto; error?: string };
      if (!res.ok || !data.comment) {
        toast.error(data.error ?? "Komentář se nepodařil.");
        return;
      }
      setComments((prev) => [...prev, data.comment!]);
      setCommentText("");
      if (post) {
        const updated = { ...post, commentCount: post.commentCount + 1 };
        setPost(updated);
        onPostUpdated(updated);
      }
    } finally {
      setCommentBusy(false);
    }
  };

  const togglePin = async () => {
    if (!post || !allowPin) return;
    setPinBusy(true);
    try {
      const res = await fetch(`${apiBase}/posts/${encodeURIComponent(slug)}/pin`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !post.pinnedAt }),
      });
      const data = (await res.json()) as { pinnedAt?: string | null };
      if (!res.ok) {
        toast.error("Připnutí selhalo.");
        return;
      }
      const updated = { ...post, pinnedAt: data.pinnedAt ?? null };
      setPost(updated);
      onPostUpdated(updated);
      toast.success(updated.pinnedAt ? "Připnuto." : "Odepnuto.");
    } finally {
      setPinBusy(false);
    }
  };

  const deletePost = async () => {
    if (!post) return;
    const isAuthor = post.author.id === session?.user?.id;
    if (!isAuthor && !allowDeleteAny) return;
    if (!confirm("Smazat tento příspěvek?")) return;
    const res = await fetch(`${apiBase}/posts/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      toast.error("Smazání selhalo.");
      return;
    }
    toast.success("Příspěvek smazán.");
    onDeleted();
  };

  const canDelete = post && (allowDeleteAny || post.author.id === session?.user?.id);

  if (loading) {
    return (
      <div className={`flex h-48 items-center justify-center ${fifaUi ? "text-[var(--fifa-text-muted)]" : "text-white/50"}`}>
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return <p className={`text-sm ${fifaUi ? "text-[var(--fifa-text-muted)]" : "text-white/50"}`}>Příspěvek nenalezen.</p>;
  }

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesByParent = comments.reduce<Record<string, CommunityCommentDto[]>>((acc, c) => {
    if (!c.parentId) return acc;
    (acc[c.parentId] ??= []).push(c);
    return acc;
  }, {});

  const actionBtn = fifaUi ? `${FIFA_BTN_SECONDARY} text-xs` : "inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10";
  const deleteBtn = fifaUi
    ? "inline-flex items-center gap-1 rounded-[var(--fifa-radius-md)] border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-950/40"
    : "inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-950/40";
  const sectionBorder = fifaUi ? "border-[var(--fifa-border)]" : "border-white/10";
  const commentMeta = fifaUi ? "text-[11px] text-[var(--fifa-text-muted)]" : "text-[11px] text-white/45";
  const commentsHeading = fifaUi ? "text-sm font-semibold text-[var(--fifa-text-secondary)]" : "text-sm font-semibold text-white/80";
  const textareaClass = fifaUi
    ? `${FIFA_INPUT} min-h-[44px] flex-1 resize-none py-2`
    : "min-h-[44px] flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white";
  const sendBtn = fifaUi ? `${FIFA_BTN_PRIMARY} shrink-0 px-3` : "self-end rounded-xl bg-cyan-600 px-3 py-2 text-white disabled:opacity-40";

  return (
    <div className={fifaUi ? "fifa-forum-detail" : "space-y-4"}>
      <div className={fifaUi ? "fifa-forum-post-layout" : "flex flex-wrap items-start justify-between gap-3"}>
        {fifaUi ? (
          <aside className="fifa-forum-post-layout__author">
            <div className="fifa-forum-avatar fifa-forum-avatar--lg" aria-hidden>
              {post.author.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.author.image} alt="" className="h-full w-full object-cover" />
              ) : (
                authorInitials(post.author.displayName)
              )}
            </div>
            <p className="fifa-forum-post-layout__author-name">
              {post.author.isStaff || post.isStaffPost ? (
                <span className="fifa-forum-chip fifa-forum-chip--staff">Admin</span>
              ) : (
                post.author.displayName
              )}
            </p>
            <time className="fifa-forum-post-layout__author-time" dateTime={post.createdAt}>
              {formatRelativeTime(post.createdAt)}
            </time>
          </aside>
        ) : null}

        <div className={fifaUi ? "fifa-forum-post-layout__body min-w-0 flex-1" : "flex min-w-0 items-start gap-3"}>
          {!fifaUi ? (
            <div className="flex min-w-0 items-start gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-white">{post.title}</h2>
              </div>
            </div>
          ) : null}

          {fifaUi ? (
            <div className="fifa-forum-post-layout__head">
              <h2 className="fifa-forum-post-layout__title">{post.title}</h2>
              <div className="fifa-forum-post-layout__actions">
                {allowPin ? (
                  <button type="button" disabled={pinBusy} onClick={() => void togglePin()} className={actionBtn}>
                    <Pin className="h-3.5 w-3.5" />
                    {post.pinnedAt ? "Odepnout" : "Připnout"}
                  </button>
                ) : null}
                {canDelete ? (
                  <button type="button" onClick={() => void deletePost()} className={deleteBtn}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Smazat
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex shrink-0 flex-wrap gap-2">
              {allowPin ? (
                <button type="button" disabled={pinBusy} onClick={() => void togglePin()} className={actionBtn}>
                  <Pin className="h-3.5 w-3.5" />
                  {post.pinnedAt ? "Odepnout" : "Připnout"}
                </button>
              ) : null}
              {canDelete ? (
                <button type="button" onClick={() => void deletePost()} className={deleteBtn}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Smazat
                </button>
              ) : null}
            </div>
          )}

          {!fifaUi ? null : <CommunityBody text={post.bodyMd} className="text-sm leading-relaxed text-[var(--fifa-text-secondary)]" />}
          {!fifaUi ? <CommunityBody text={post.bodyMd} /> : null}

          {post.attachments.map((a) => (
            <div key={a.id} className={fifaUi ? "mt-4" : "mt-3"}>
              <CommunityLineupEmbed snapshot={a.snapshot} players={players} variant="featured" />
            </div>
          ))}
        </div>
      </div>

      <div className={`border-t ${sectionBorder} pt-4`}>
        <h3 className={commentsHeading}>Komentáře ({post.commentCount})</h3>
        <ul className={`mt-3 space-y-3 ${fifaUi ? "fifa-forum-comments" : ""}`}>
          {topLevel.length === 0 ? (
            <li className={`text-sm ${fifaUi ? "text-[var(--fifa-text-muted)]" : "text-white/50"}`}>
              Zatím žádné komentáře. Buď první.
            </li>
          ) : (
            topLevel.map((c) => (
              <li key={c.id} className={fifaUi ? "fifa-forum-comment" : "rounded-xl bg-white/5 px-3 py-2"}>
                <div className={fifaUi ? "fifa-forum-comment__header" : ""}>
                  {fifaUi ? (
                    <div className="fifa-forum-avatar fifa-forum-avatar--sm" aria-hidden>
                      {c.author.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.author.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        authorInitials(c.author.displayName)
                      )}
                    </div>
                  ) : null}
                  <p className={commentMeta}>
                    {c.author.displayName} · {formatRelativeTime(c.createdAt)}
                  </p>
                </div>
                <CommunityBody text={c.bodyMd} className={fifaUi ? "mt-1.5 text-sm" : "mt-1"} />
                {(repliesByParent[c.id] ?? []).map((r) => (
                  <div key={r.id} className={`ml-4 mt-2 border-l ${sectionBorder} pl-3`}>
                    <p className={commentMeta}>{r.author.displayName}</p>
                    <CommunityBody text={r.bodyMd} />
                  </div>
                ))}
              </li>
            ))
          )}
        </ul>

        <div className={`mt-4 flex gap-2 ${fifaUi ? "fifa-forum-compose" : ""}`}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={2}
            placeholder="Napsat komentář…"
            className={textareaClass}
          />
          <button
            type="button"
            disabled={commentBusy || !commentText.trim()}
            onClick={() => void submitComment()}
            className={`${sendBtn} self-end disabled:opacity-40`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
