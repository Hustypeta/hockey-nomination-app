import type { DropTarget } from "@/lib/lineupAssign";

export function droppableIdForSlot(target: DropTarget): string {
  if (target.type === "goalie") return `slot-goalie-${target.index}`;
  if (target.type === "defense") return `slot-def-${target.pairIndex}-${target.role}`;
  if (target.type === "forward") return `slot-fwd-${target.lineIndex}-${target.role}`;
  if (target.type === "extraDefenseman") return `slot-xd-${target.slotIndex}`;
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
    if (pairIndex >= 0 && pairIndex <= 2) return { type: "defense", pairIndex, role };
    if (pairIndex === 3 && role === "lb") return { type: "defense", pairIndex: 3, role: "lb" };
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
    if (n === 0 || n === 1) return { type: "extraForward", slotIndex: n as 0 | 1 };
    return null;
  }
  if (id.startsWith("slot-xd-")) {
    const n = Number(id.slice("slot-xd-".length));
    if (n === 0) return { type: "extraDefenseman", slotIndex: 0 };
    return null;
  }
  return null;
}
