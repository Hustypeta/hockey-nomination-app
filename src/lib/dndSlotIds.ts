import type { DropTarget } from "@/lib/lineupAssign";

export function droppableIdForSlot(target: DropTarget): string {
  if (target.type === "goalie") return `slot-goalie-${target.index}`;
  if (target.type === "defense") return `slot-def-${target.pairIndex}-${target.role}`;
  if (target.type === "forward") return `slot-fwd-${target.lineIndex}-${target.role}`;
  return `slot-xf-${target.slotIndex}`;
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
    if (pairIndex >= 0 && pairIndex <= 3) return { type: "defense", pairIndex, role };
    return null;
  }
  if (id.startsWith("slot-fwd-")) {
    const rest = id.slice("slot-fwd-".length);
    const m = rest.match(/^(\d+)-(lw|c|rw)$/);
    if (!m) return null;
    const lineIndex = Number(m[1]);
    const role = m[2] as "lw" | "c" | "rw";
    if (lineIndex >= 0 && lineIndex <= 3) return { type: "forward", lineIndex, role };
    return null;
  }
  if (id.startsWith("slot-xf-")) {
    const n = Number(id.slice("slot-xf-".length));
    if (n === 0 || n === 1) return { type: "extraForward", slotIndex: n as 0 | 1 };
    return null;
  }
  return null;
}
