"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";

export function DroppableSlotWrap({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`
        ${className}
        min-w-0 w-full rounded-2xl transition-[box-shadow,background-color] duration-200
        ${isOver ? "jersey-slot-dnd-highlight bg-[#003087]/12 ring-2 ring-sky-400/90 ring-offset-2 ring-offset-[#05080f] shadow-[0_0_32px_rgba(56,189,248,0.35),0_0_48px_rgba(200,16,46,0.12)]" : ""}
      `}
    >
      {children}
    </div>
  );
}
