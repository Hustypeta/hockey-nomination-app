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
      className={`${className} ${isOver ? "rounded-2xl ring-2 ring-[#d4af37]/80 ring-offset-2 ring-offset-[#0a0a0a]" : ""}`}
    >
      {children}
    </div>
  );
}
