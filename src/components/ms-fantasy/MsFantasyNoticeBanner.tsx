"use client";

import { AlertTriangle } from "lucide-react";
import type { MsFantasyNotice } from "@/lib/msFantasyConfig";

export function MsFantasyNoticeBanner({ notice, className = "" }: { notice: MsFantasyNotice; className?: string }) {
  return (
    <div
      role="status"
      className={[
        "rounded-xl border border-amber-400/35 bg-amber-500/10 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:px-4 sm:py-3.5",
        className,
      ].join(" ")}
    >
      <p className="flex items-start gap-2 font-display text-[0.68rem] font-bold uppercase tracking-[0.12em] text-amber-100 sm:text-xs">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
        {notice.title}
      </p>
      <p className="mt-2 text-[0.8125rem] leading-relaxed text-amber-50/95 sm:text-sm">{notice.body}</p>
    </div>
  );
}
