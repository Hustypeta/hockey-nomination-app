"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import {
  FORUM_POST_BODY_MAX,
  FORUM_POST_BODY_MAX_LINES,
} from "@/lib/community/validate";
import type { Player } from "@/types";

function FittedForumText({
  title,
  body,
  isDense,
  isLegacyLong,
}: {
  title: string;
  body: string;
  isDense: boolean;
  isLegacyLong: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bodyWrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const bodyEl = bodyWrapRef.current?.firstElementChild as HTMLElement | null;
    if (!wrap || !bodyEl) return;

    const start = isLegacyLong ? 14 : isDense ? 15 : 16;
    const floor = 13;
    const lineHeight = isLegacyLong ? "1.4" : isDense ? "1.42" : "1.45";

    const fit = () => {
      let size = start;
      bodyEl.style.setProperty("font-size", `${size}px`, "important");
      bodyEl.style.setProperty("line-height", lineHeight, "important");
      while (size > floor && wrap.scrollHeight > wrap.clientHeight + 1) {
        size -= 0.25;
        bodyEl.style.setProperty("font-size", `${size}px`, "important");
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [title, body, isDense, isLegacyLong]);

  return (
    <div ref={wrapRef} className="fifa-forum-post-card__frame-text">
      <h2 className="fifa-forum-post-card__frame-title">{title}</h2>
      <div ref={bodyWrapRef}>
        <CommunityBody
          text={body}
          className={[
            "fifa-forum-post-card__frame-body !text-inherit",
            isDense ? "fifa-forum-post-card__frame-body--dense" : "",
            isLegacyLong ? "fifa-forum-post-card__frame-body--legacy" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
    </div>
  );
}

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
  const bodyLineCount = post.bodyMd.split(/\r\n?|\n/).length;
  const isLegacyLong =
    post.bodyMd.length > FORUM_POST_BODY_MAX ||
    bodyLineCount > FORUM_POST_BODY_MAX_LINES;
  const isDense = post.bodyMd.length > 220;

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
      <FittedForumText
        title={post.title}
        body={post.bodyMd}
        isDense={isDense}
        isLegacyLong={isLegacyLong}
      />
    </div>
  );
}
