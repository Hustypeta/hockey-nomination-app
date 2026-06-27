"use client";

import { useId, useMemo } from "react";
import {
  fifaRinkChemistrySegments,
  type FifaRinkChemistryEdge,
  type FifaRinkSlotLayout,
} from "@/lib/fifa/fifaRinkChemistry";

type FifaRinkChemistryLinesProps = {
  edges: FifaRinkChemistryEdge[];
  slotLayout: FifaRinkSlotLayout;
};

export function FifaRinkChemistryLines({ edges, slotLayout }: FifaRinkChemistryLinesProps) {
  const uid = useId().replace(/:/g, "");
  const glowFilterId = `fifa-chem-glow-${uid}`;
  const segments = useMemo(() => fifaRinkChemistrySegments(edges, slotLayout), [edges, slotLayout]);

  if (segments.length === 0) return null;

  return (
    <svg
      className="fifa-rink-chemistry"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <filter id={glowFilterId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="0.35" />
        </filter>
      </defs>
      {segments.map(({ key, x1, y1, x2, y2 }) => (
        <g key={key} className="fifa-rink-chemistry__segment">
          <line
            className="fifa-rink-chemistry__glow"
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            filter={`url(#${glowFilterId})`}
            vectorEffect="nonScalingStroke"
          />
          <line
            className="fifa-rink-chemistry__core"
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            vectorEffect="nonScalingStroke"
          />
        </g>
      ))}
    </svg>
  );
}
