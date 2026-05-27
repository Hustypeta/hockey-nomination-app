"use client";

import { Flame, TrendingUp, Users } from "lucide-react";
import type { CommunityPostDto } from "@/lib/community/types";

function statCard({ icon, title, value, hint }: { icon: React.ReactNode; title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/45">{title}</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-white">{value}</p>
          <p className="mt-1 text-xs text-white/45">{hint}</p>
        </div>
        <div className="rounded-xl border border-cyan-400/15 bg-cyan-500/10 p-2 text-cyan-200">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function CommunitySidebar({
  posts,
  stats,
}: {
  posts: CommunityPostDto[];
  stats: { postCount: number; userCount?: number | null };
}) {
  const trending = [...posts].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <aside className="space-y-3">
      {statCard({
        icon: <Users className="h-5 w-5" />,
        title: "Komunita",
        value: `${stats.postCount}`,
        hint: "příspěvků v posledních dnech",
      })}
      {statCard({
        icon: <TrendingUp className="h-5 w-5" />,
        title: "Aktivita",
        value: `${posts.reduce((n, p) => n + p.commentCount, 0)}`,
        hint: "komentářů v feedu",
      })}

      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.03] p-4">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-[#ff2d55]" />
          <h3 className="text-sm font-extrabold text-white">Žhavé témata</h3>
        </div>
        <ul className="mt-3 space-y-2">
          {trending.length === 0 ? (
            <li className="text-xs text-white/45">Zatím nic netrenduje.</li>
          ) : (
            trending.map((p) => (
              <li key={p.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="line-clamp-2 text-sm font-semibold text-white">{p.title}</p>
                <p className="mt-1 text-[11px] text-white/50">
                  👍 {p.likeCount} · 💬 {p.commentCount}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}

