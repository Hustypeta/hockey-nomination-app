import {
  FIFA_RINK_TEMPLATE_SLOTS,
  type FifaRinkSlotRect,
  type FifaRinkTemplatePos,
} from "@/lib/fifa/fifaRinkTemplate";

export type FifaRinkChemistryEdge = [FifaRinkTemplatePos, FifaRinkTemplatePos];

export function fifaRinkChemistryEdges(opts: {
  hasDefense: boolean;
  defenseSolo: boolean;
  showGoalie: boolean;
}): FifaRinkChemistryEdge[] {
  const edges: FifaRinkChemistryEdge[] = [
    ["lw", "c"],
    ["c", "rw"],
  ];

  if (opts.hasDefense) {
    if (opts.defenseSolo) {
      edges.push(["lw", "d"], ["rw", "d"], ["c", "d"]);
      if (opts.showGoalie) edges.push(["d", "g"]);
    } else {
      edges.push(
        ["ld", "rd"],
        ["lw", "ld"],
        ["c", "ld"],
        ["c", "rd"],
        ["rw", "rd"]
      );
      if (opts.showGoalie) edges.push(["ld", "g"], ["rd", "g"]);
    }
  } else if (opts.showGoalie) {
    edges.push(["c", "g"]);
  }

  return edges;
}

export type FifaRinkSlotLayout = Record<FifaRinkTemplatePos, FifaRinkSlotRect>;

function shieldMetrics(pos: FifaRinkTemplatePos, slots: FifaRinkSlotLayout) {
  const slot = slots[pos];
  return {
    cx: slot.left,
    cy: slot.top,
    halfW: slot.width * 0.5,
    halfH: slot.height * 0.5,
  };
}

export function fifaRinkSlotEdgeAnchor(
  from: FifaRinkTemplatePos,
  to: FifaRinkTemplatePos,
  slots: FifaRinkSlotLayout = FIFA_RINK_TEMPLATE_SLOTS
): { x: number; y: number } {
  const fromM = shieldMetrics(from, slots);
  const toM = shieldMetrics(to, slots);

  const dx = toM.cx - fromM.cx;
  const dy = toM.cy - fromM.cy;
  const len = Math.hypot(dx, dy);
  if (len < 0.001) return { x: fromM.cx, y: fromM.cy };

  const ux = dx / len;
  const uy = dy / len;
  const scale = Math.min(
    ux !== 0 ? fromM.halfW / Math.abs(ux) : Number.POSITIVE_INFINITY,
    uy !== 0 ? fromM.halfH / Math.abs(uy) : Number.POSITIVE_INFINITY
  );

  return { x: fromM.cx + ux * scale, y: fromM.cy + uy * scale };
}

export type FifaRinkChemistrySegment = {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
};

export function fifaRinkChemistrySegments(
  edges: FifaRinkChemistryEdge[],
  slots: FifaRinkSlotLayout = FIFA_RINK_TEMPLATE_SLOTS
): FifaRinkChemistrySegment[] {
  return edges
    .map(([from, to]) => {
      const a = fifaRinkSlotEdgeAnchor(from, to, slots);
      const b = fifaRinkSlotEdgeAnchor(to, from, slots);
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      return { key: `${from}-${to}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y, length };
    })
    .sort((a, b) => b.length - a.length);
}
