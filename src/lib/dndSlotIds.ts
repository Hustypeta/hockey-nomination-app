import type { DropTarget } from "@/lib/lineupAssign";

export function droppableIdForSlot(target: DropTarget): string {
  if (target.type === "goalie") return `slot-goalie-${target.index}`;
  if (target.type === "defense") return `slot-def-${target.pairIndex}-${target.role}`;
  if (target.type === "forward") return `slot-fwd-${target.lineIndex}-${target.role}`;
  if (target.type === "extraDefenseman") return `slot-xd-${target.slotIndex}`;
  return `slot-xf-${target.slotIndex}`;
}

/** Opačný směr k {@link parseDroppableId} — z výběru slotu ve stavu editoru. */
export function droppableIdFromSelectedSlot(slot: {
  type: string;
  lineIndex?: number;
  role?: string;
}): string | null {
  const { type, lineIndex, role } = slot;
  if (type === "goalie" && lineIndex !== undefined && lineIndex >= 0 && lineIndex <= 2) {
    return `slot-goalie-${lineIndex}`;
  }
  if (
    type === "forward" &&
    lineIndex !== undefined &&
    lineIndex >= 0 &&
    lineIndex <= 3 &&
    role &&
    (role === "lw" || role === "c" || role === "rw" || role === "x")
  ) {
    return `slot-fwd-${lineIndex}-${role}`;
  }
  if (
    type === "defense" &&
    lineIndex !== undefined &&
    lineIndex >= 0 &&
    lineIndex <= 3 &&
    role &&
    (role === "lb" || role === "rb")
  ) {
    return `slot-def-${lineIndex}-${role}`;
  }
  if (type === "extraForward") return "slot-xf-0";
  if (type === "extraDefenseman") return "slot-xd-0";
  return null;
}

export function parseDroppableId(id: string): DropTarget | null {
  if (id.startsWith("slot-goalie-")) {
    const index = Number(id.slice("slot-goalie-".length));
    if (Number.isInteger(index) && index >= 0 && index <= 2) return { type: "goalie", index };
    return null;
  }
  if (id.startsWith("slot-def-")) {
    const rest = id.slice("slot-def-".length);
    const m = rest.match(/^(\d+)-(lb|rb)$/);
    if (!m) return null;
    const pairIndex = Number(m[1]);
    const role = m[2] as "lb" | "rb";
    if (pairIndex >= 0 && pairIndex <= 2) return { type: "defense", pairIndex, role };
    // 4. pár / 7. bek: v nominaci se používá jen `lb`, v zápasu může být i `rb` (8D).
    if (pairIndex === 3) return { type: "defense", pairIndex: 3, role };
    return null;
  }
  if (id.startsWith("slot-fwd-")) {
    const rest = id.slice("slot-fwd-".length);
    const m = rest.match(/^(\d+)-(lw|c|rw|x)$/);
    if (!m) return null;
    const lineIndex = Number(m[1]);
    const role = m[2] as "lw" | "c" | "rw" | "x";
    if (lineIndex < 0 || lineIndex > 3) return null;
    if (role === "x" && lineIndex !== 3) return null;
    return { type: "forward", lineIndex, role };
  }
  if (id.startsWith("slot-xf-")) {
    const n = Number(id.slice("slot-xf-".length));
    // slot-xf-1: zpětná kompatibilita starého UI (druhý náhradní útočník)
    if (n === 0 || n === 1) return { type: "extraForward", slotIndex: 0 };
    return null;
  }
  if (id.startsWith("slot-xd-")) {
    const n = Number(id.slice("slot-xd-".length));
    if (n === 0) return { type: "extraDefenseman", slotIndex: 0 };
    return null;
  }
  return null;
}
