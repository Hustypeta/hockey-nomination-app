"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CommunityPostDto } from "@/lib/community/types";
import {
  computeForumPosterContainScale,
  FORUM_POST_FRAME_H,
  FORUM_POST_FRAME_W,
  NOMINATION_WEB_POSTER_H,
  NOMINATION_WEB_POSTER_W,
} from "@/lib/sharePosterLayout";
import { CommunityBody } from "@/components/komunita/CommunityBody";
import { CommunityPosterThumb } from "@/components/komunita/CommunityPosterThumb";
import type { Player } from "@/types";

export function CommunityPostMediaFrame({
  post,
  players,
}: {
  post: CommunityPostDto;
  players: Player[];
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [posterNatural, setPosterNatural] = useState({
    width: NOMINATION_WEB_POSTER_W,
    height: NOMINATION_WEB_POSTER_H,
  });

  const handlePosterNaturalSize = useCallback((size: { width: number; height: number }) => {
    setPosterNatural((prev) =>
      prev.width === size.width && prev.height === size.height ? prev : size
    );
  }, []);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    const sync = () => {
      const rect = node.getBoundingClientRect();
      setFrameSize({ width: rect.width, height: rect.height });
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const attachment = post.attachments[0];
  const snapshot = attachment?.snapshot;
  const lineup = snapshot?.lineupStructure;
  const imageUrl =
    typeof snapshot?.meta?.imageUrl === "string" && snapshot.meta.imageUrl.trim()
      ? snapshot.meta.imageUrl.trim()
      : null;
  const imageAlt =
    typeof snapshot?.meta?.imageAlt === "string" && snapshot.meta.imageAlt.trim()
      ? snapshot.meta.imageAlt.trim()
      : post.title;

  if (imageUrl) {
    return (
      <div ref={frameRef} className="fifa-forum-post-card__frame fifa-forum-post-card__frame--image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={imageAlt} className="fifa-forum-post-card__frame-image" />
      </div>
    );
  }

  if (snapshot?.kind === "FANTASY_LINEUP") {
    const salary = snapshot.meta?.salarySpent;
    const picks = snapshot.meta?.pickCount;
    return (
      <div ref={frameRef} className="fifa-forum-post-card__frame">
        <div className="fifa-forum-post-card__frame-fantasy">
          <p className="fifa-forum-post-card__frame-kicker">Fantasy sestava</p>
          <p className="fifa-forum-post-card__frame-fantasy-title">{snapshot.title ?? "Fantasy den"}</p>
          <p className="fifa-forum-post-card__frame-fantasy-meta">
            {typeof picks === "number" ? `${picks} hráčů` : null}
            {typeof picks === "number" && typeof salary === "number" ? " · " : null}
            {typeof salary === "number" ? `${salary} kreditů` : null}
          </p>
        </div>
      </div>
    );
  }

  if (lineup && snapshot) {
    const posterScale =
      frameSize.width > 0 && frameSize.height > 0
        ? computeForumPosterContainScale(
            frameSize.width,
            frameSize.height,
            posterNatural.width,
            posterNatural.height
          )
        : computeForumPosterContainScale(FORUM_POST_FRAME_W, FORUM_POST_FRAME_H);

    return (
      <div ref={frameRef} className="fifa-forum-post-card__frame fifa-forum-post-card__frame--lineup">
        <div className="fifa-forum-post-card__frame-poster">
          <CommunityPosterThumb
            players={players}
            lineup={lineup}
            captainId={snapshot.captainId ?? null}
            createdAtIso={snapshot.createdAt}
            title={snapshot.title}
            scale={posterScale}
            onNaturalSize={handlePosterNaturalSize}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={frameRef} className="fifa-forum-post-card__frame fifa-forum-post-card__frame--text">
      <div className="fifa-forum-post-card__frame-text">
        <h2 className="fifa-forum-post-card__frame-title">{post.title}</h2>
        <CommunityBody text={post.bodyMd} className="fifa-forum-post-card__frame-body !text-inherit" />
      </div>
    </div>
  );
}
