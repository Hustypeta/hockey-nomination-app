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
        ${isOver ? "jersey-slot-dnd-highlight bg-[#c8102e]/10 ring-2 ring-[#c8102e]/85 ring-offset-2 ring-offset-[#05080f] shadow-[0_0_36px_rgba(200,16,46,0.35),0_0_52px_rgba(0,48,135,0.15)]" : ""}
      `}
    >
      {children}
    </div>
  );
}
