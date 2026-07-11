"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CommunityAttachmentSnapshotV1 } from "@/lib/community/types";
import { computeForumPosterContainScale } from "@/lib/sharePosterLayout";
import type { Player } from "@/types";
import { CommunityPosterThumb } from "@/components/komunita/CommunityPosterThumb";

export function CommunityLineupEmbed({
  snapshot,
  players,
  variant = "compact",
}: {
  snapshot: CommunityAttachmentSnapshotV1;
  players: Player[];
  variant?: "compact" | "featured";
}) {
  const posterWrapRef = useRef<HTMLDivElement>(null);
  const [posterScale, setPosterScale] = useState(0.32);

  const syncPosterScale = useCallback(() => {
    const node = posterWrapRef.current;
    if (!node) return;
    const width = node.clientWidth;
    const height = node.clientHeight;
    if (width <= 0 || height <= 0) return;
    setPosterScale(computeForumPosterContainScale(width, height));
  }, []);

  useEffect(() => {
    if (variant !== "featured") return;
    const node = posterWrapRef.current;
    if (!node) return;

    syncPosterScale();
    const observer = new ResizeObserver(syncPosterScale);
    observer.observe(node);
    return () => observer.disconnect();
  }, [variant, syncPosterScale, snapshot]);

  const imageUrl =
    typeof snapshot.meta?.imageUrl === "string" && snapshot.meta.imageUrl.trim()
      ? snapshot.meta.imageUrl.trim()
      : null;

  if (imageUrl) {
    const imageAlt =
      typeof snapshot.meta?.imageAlt === "string" && snapshot.meta.imageAlt.trim()
        ? snapshot.meta.imageAlt.trim()
        : snapshot.title ?? "Příloha";

    if (variant === "featured") {
      return (
        <figure className="fifa-forum-detail-attachment">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={imageAlt} className="fifa-forum-detail-attachment__media" />
        </figure>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 aspect-[4/5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={imageAlt} className="h-full w-full object-contain" />
      </div>
    );
  }

  if (snapshot.kind === "FANTASY_LINEUP") {
    const salary = snapshot.meta?.salarySpent;
    const picks = snapshot.meta?.pickCount;

    if (variant === "featured") {
      return (
        <figure className="fifa-forum-detail-attachment fifa-forum-detail-attachment--fantasy">
          <div className="fifa-forum-detail-attachment__fantasy-body">
            <p className="fifa-forum-detail-attachment__fantasy-kicker">Fantasy sestava</p>
            <p className="fifa-forum-detail-attachment__fantasy-title">{snapshot.title ?? "Fantasy den"}</p>
            <p className="fifa-forum-detail-attachment__fantasy-meta">
              {typeof picks === "number" ? `${picks} hráčů` : null}
              {typeof picks === "number" && typeof salary === "number" ? " · " : null}
              {typeof salary === "number" ? `${salary} kreditů` : null}
            </p>
          </div>
          {snapshot.sourcePath ? (
            <figcaption className="fifa-forum-detail-attachment__caption">
              <Link href={snapshot.sourcePath} className="fifa-forum-detail-attachment__link">
                Otevřít fantasy →
              </Link>
            </figcaption>
          ) : null}
        </figure>
      );
    }

    return (
      <div className="rounded-xl border border-cyan-500/25 bg-cyan-950/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-cyan-300/80">Fantasy sestava</p>
        <p className="mt-1 font-semibold text-white">{snapshot.title ?? "Fantasy den"}</p>
        <p className="mt-1 text-xs text-white/55">
          {typeof picks === "number" ? `${picks} hráčů` : null}
          {typeof salary === "number" ? ` · ${salary} kreditů` : null}
        </p>
        {snapshot.sourcePath ? (
          <Link href={snapshot.sourcePath} className="mt-2 inline-block text-xs text-cyan-400 hover:underline">
            Otevřít fantasy →
          </Link>
        ) : null}
      </div>
    );
  }

  const ls = snapshot.lineupStructure;
  if (!ls) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50">
        Příloha sestavy
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <figure className="fifa-forum-detail-attachment fifa-forum-detail-attachment--lineup">
        <div ref={posterWrapRef} className="fifa-forum-detail-attachment__poster">
          <CommunityPosterThumb
            players={players}
            lineup={ls}
            captainId={snapshot.captainId ?? null}
            createdAtIso={snapshot.createdAt}
            title={snapshot.title}
            scale={posterScale}
          />
        </div>
        {snapshot.sourcePath ? (
          <figcaption className="fifa-forum-detail-attachment__caption">
            <Link href={snapshot.sourcePath} target="_blank" className="fifa-forum-detail-attachment__link">
              Otevřít sestavu →
            </Link>
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-3">
      <CommunityPosterThumb
        players={players}
        lineup={ls}
        captainId={snapshot.captainId ?? null}
        createdAtIso={snapshot.createdAt}
        title={snapshot.title}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{snapshot.title ?? "Sestava"}</p>
        {snapshot.sourcePath ? (
          <Link
            href={snapshot.sourcePath}
            target="_blank"
            className="mt-1 inline-block text-xs text-cyan-400 hover:underline"
          >
            Otevřít sestavu →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
