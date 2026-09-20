"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FifaRinkChemistryLines } from "@/components/fifa/FifaRinkChemistryLines";
import { FifaRinkShieldFrame } from "@/components/fifa/FifaRinkShieldFrame";
import { MQ_LAYOUT_NARROW, useMediaQuery } from "@/hooks/useMediaQuery";
import { fifaRinkChemistryEdges } from "@/lib/fifa/fifaRinkChemistry";
import {
  FIFA_RINK_TEMPLATE_HEIGHT,
  FIFA_RINK_TEMPLATE_MOBILE_HEIGHT,
  FIFA_RINK_TEMPLATE_MOBILE_SRC,
  FIFA_RINK_TEMPLATE_MOBILE_WIDTH,
  FIFA_RINK_TEMPLATE_SLOTS,
  FIFA_RINK_TEMPLATE_SLOTS_MOBILE,
  FIFA_RINK_TEMPLATE_SRC,
  FIFA_RINK_TEMPLATE_WIDTH,
  type FifaRinkSlotRect,
  type FifaRinkTemplatePos,
} from "@/lib/fifa/fifaRinkTemplate";

type FifaMatchLineRinkProps = {
  activeLine: number;
  onActiveLineChange: (index: number) => void;
  /** Statický náhled — bez pageru, nápovědy a swipe. */
  preview?: boolean;
  /** Schová pager lajn, ale nechá mobilní šablonu ledu (kvíz startovní šestky). */
  hidePager?: boolean;
  slotsForLine: (lineIndex: number) => {
    forwards: { lw: ReactNode; c: ReactNode; rw: ReactNode };
    defense: ReactNode[] | null;
    bench: { left: ReactNode | null; right: ReactNode | null };
  };
  /** Základní brankář — jeden slot pro celou sestavu, viditelný na všech lajnách. */
  starterGoalie: ReactNode;
};

function TemplateSlot({
  pos,
  slot,
  children,
  variant = "skater",
  benchLabel,
}: {
  pos: FifaRinkTemplatePos;
  slot: FifaRinkSlotRect;
  children: ReactNode;
  variant?: "skater" | "goalie";
  benchLabel?: string;
}) {
  const isBench = pos === "benchL" || pos === "benchR";
  return (
    <div
      className={`fifa-rink-template__slot fifa-rink-template__slot--${variant}${isBench ? " fifa-rink-template__slot--bench" : ""}`}
      data-rink-pos={pos}
      data-bench-label={benchLabel}
      style={{
        left: `${slot.left}%`,
        top: `${slot.top}%`,
        width: `${slot.width}%`,
      }}
    >
      <div className="fifa-rink-shield-wrap" aria-hidden>
        <FifaRinkShieldFrame />
      </div>
      {children}
    </div>
  );
}

export function FifaMatchLineRink({
  activeLine,
  onActiveLineChange,
  preview = false,
  hidePager = false,
  slotsForLine,
  starterGoalie,
}: FifaMatchLineRinkProps) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const isMobileLayout = useMediaQuery(MQ_LAYOUT_NARROW);
  const useMobileTemplate = !preview && isMobileLayout;
  const lockLine = preview || hidePager;
  const slotLayout = useMobileTemplate ? FIFA_RINK_TEMPLATE_SLOTS_MOBILE : FIFA_RINK_TEMPLATE_SLOTS;

  const lineCount = 4;
  const slots = slotsForLine(activeLine);
  const hasDefense = slots.defense != null && slots.defense.length > 0;
  const defenseSolo = slots.defense?.length === 1;
  const showBenchLeft = activeLine === 3 && slots.bench.left != null;
  const showBenchRight = activeLine === 3 && slots.bench.right != null;

  const chemistryEdges = useMemo(
    () =>
      fifaRinkChemistryEdges({
        hasDefense,
        defenseSolo,
        showGoalie: true,
      }),
    [hasDefense, defenseSolo]
  );

  const goPrev = () => onActiveLineChange((activeLine - 1 + lineCount) % lineCount);
  const goNext = () => onActiveLineChange((activeLine + 1) % lineCount);

  return (
    <div className={`fifa-match-rink flex min-h-0 flex-1 flex-col${preview ? " fifa-match-rink--preview" : ""}`}>
      {!lockLine ? (
      <div className="fifa-line-pager shrink-0">
        <button
          type="button"
          className="fifa-line-pager__arrow"
          onClick={goPrev}
          aria-label="Předchozí lajna"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <div className="fifa-line-pager__tabs" role="tablist" aria-label="Lajny">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={activeLine === i}
              className={`fifa-line-pager__tab ${activeLine === i ? "fifa-line-pager__tab--active" : ""}`}
              onClick={() => onActiveLineChange(i)}
            >
              {i + 1}. lajna
            </button>
          ))}
        </div>
        <button
          type="button"
          className="fifa-line-pager__arrow"
          onClick={goNext}
          aria-label="Další lajna"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
      ) : null}

      <div
        className="fifa-match-rink__stage min-h-0 flex-1 touch-pan-y"
        onTouchStart={
          lockLine
            ? undefined
            : (e) => setTouchStartX(e.touches[0]?.clientX ?? null)
        }
        onTouchEnd={
          lockLine
            ? undefined
            : (e) => {
                if (touchStartX == null) return;
                const dx = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
                if (Math.abs(dx) > 48) {
                  if (dx < 0) goNext();
                  else goPrev();
                }
                setTouchStartX(null);
              }
        }
      >
        <div className="fifa-rink-board">
          <div className="fifa-rink-template">
            <div className="fifa-rink-template__frame">
              {/* eslint-disable-next-line @next/next/no-img-element -- pixel-perfect overlay se šablonou */}
              <picture>
                {!preview ? (
                  <source
                    media="(max-width: 1023px) and (max-device-width: 1023px)"
                    srcSet={FIFA_RINK_TEMPLATE_MOBILE_SRC}
                  />
                ) : null}
                <img
                  src={useMobileTemplate ? FIFA_RINK_TEMPLATE_MOBILE_SRC : FIFA_RINK_TEMPLATE_SRC}
                  alt=""
                  width={useMobileTemplate ? FIFA_RINK_TEMPLATE_MOBILE_WIDTH : FIFA_RINK_TEMPLATE_WIDTH}
                  height={useMobileTemplate ? FIFA_RINK_TEMPLATE_MOBILE_HEIGHT : FIFA_RINK_TEMPLATE_HEIGHT}
                  className="fifa-rink-template__img"
                  draggable={false}
                />
              </picture>
              <FifaRinkChemistryLines edges={chemistryEdges} slotLayout={slotLayout} />
              <div className="fifa-rink-template__overlay">
                <TemplateSlot pos="lw" slot={slotLayout.lw}>
                  {slots.forwards.lw}
                </TemplateSlot>
                <TemplateSlot pos="c" slot={slotLayout.c}>
                  {slots.forwards.c}
                </TemplateSlot>
                <TemplateSlot pos="rw" slot={slotLayout.rw}>
                  {slots.forwards.rw}
                </TemplateSlot>

                {hasDefense ? (
                  defenseSolo ? (
                    <TemplateSlot pos="d" slot={slotLayout.d}>
                      {slots.defense![0]}
                    </TemplateSlot>
                  ) : (
                    <>
                      <TemplateSlot pos="ld" slot={slotLayout.ld}>
                        {slots.defense![0]}
                      </TemplateSlot>
                      <TemplateSlot pos="rd" slot={slotLayout.rd}>
                        {slots.defense![1]}
                      </TemplateSlot>
                    </>
                  )
                ) : null}

                <TemplateSlot pos="g" slot={slotLayout.g} variant="goalie">
                  {starterGoalie}
                </TemplateSlot>

                {showBenchLeft ? (
                  <TemplateSlot pos="benchL" slot={slotLayout.benchL} variant="goalie" benchLabel="Náhr. G">
                    {slots.bench.left}
                  </TemplateSlot>
                ) : null}

                {showBenchRight ? (
                  <TemplateSlot pos="benchR" slot={slotLayout.benchR} benchLabel="13. F">
                    {slots.bench.right}
                  </TemplateSlot>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
