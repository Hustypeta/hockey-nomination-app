"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pin, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import type { CommunityCommentDto, CommunityPostDto } from "@/lib/community/types";
import { CommunityBody } from "@/components/komunita/CommunityBody";
import { CommunityLineupEmbed } from "@/components/komunita/CommunityLineupEmbed";
import type { Player } from "@/types";

export function PostDetailPanel({
  slug,
  players,
  onPostUpdated,
  onDeleted,
}: {
  slug: string;
  players: Player[];
  onPostUpdated: (post: CommunityPostDto) => void;
  onDeleted: () => void;
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
        fetch(`/api/admin/komunita/posts/${encodeURIComponent(slug)}`, {
          credentials: "include",
        }),
        fetch(`/api/admin/komunita/posts/${encodeURIComponent(slug)}/comments`, {
          credentials: "include",
        }),
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
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setCommentBusy(true);
    try {
      const res = await fetch(
        `/api/admin/komunita/posts/${encodeURIComponent(slug)}/comments`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bodyMd: commentText }),
        }
      );
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
    if (!post) return;
    setPinBusy(true);
    try {
      const res = await fetch(`/api/admin/komunita/posts/${encodeURIComponent(slug)}/pin`, {
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
    if (!post || post.author.id !== session?.user?.id) return;
    if (!confirm("Smazat tento příspěvek?")) return;
    const res = await fetch(`/api/admin/komunita/posts/${encodeURIComponent(slug)}`, {
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

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-white/50">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return <p className="text-sm text-white/50">Vyber příspěvek ze seznamu.</p>;
  }

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesByParent = comments.reduce<Record<string, CommunityCommentDto[]>>((acc, c) => {
    if (!c.parentId) return acc;
    (acc[c.parentId] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pinBusy}
          onClick={() => void togglePin()}
          className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
        >
          <Pin className="h-3.5 w-3.5" />
          {post.pinnedAt ? "Odepnout" : "Připnout"}
        </button>
        {session?.user?.id === post.author.id ? (
          <button
            type="button"
            onClick={() => void deletePost()}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-950/40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Smazat
          </button>
        ) : null}
      </div>

      <h2 className="text-xl font-bold text-white">{post.title}</h2>
      <CommunityBody text={post.bodyMd} />
      {post.attachments.map((a) => (
        <CommunityLineupEmbed key={a.id} snapshot={a.snapshot} players={players} />
      ))}

      <div className="border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold text-white/80">Komentáře ({post.commentCount})</h3>
        <ul className="mt-3 space-y-3">
          {topLevel.map((c) => (
            <li key={c.id} className="rounded-xl bg-white/5 px-3 py-2">
              <p className="text-[11px] text-white/45">
                {c.author.name ?? "Hráč"} ·{" "}
                {new Date(c.createdAt).toLocaleString("cs-CZ", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <CommunityBody text={c.bodyMd} className="mt-1" />
              {(repliesByParent[c.id] ?? []).map((r) => (
                <div key={r.id} className="ml-4 mt-2 border-l border-white/10 pl-3">
                  <p className="text-[11px] text-white/45">{r.author.name ?? "Hráč"}</p>
                  <CommunityBody text={r.bodyMd} />
                </div>
              ))}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={2}
            placeholder="Napsat komentář…"
            className="min-h-[44px] flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            disabled={commentBusy || !commentText.trim()}
            onClick={() => void submitComment()}
            className="self-end rounded-xl bg-cyan-600 px-3 py-2 text-white disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
