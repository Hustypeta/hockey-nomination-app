"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";

export function DroppableSlotWrap({
  id,
  children,
  className = "",
  lightSurface = false,
  renderContent,
}: {
  id: string;
  children?: ReactNode;
  className?: string;
  /** NHL / světlý lineup panel — kontrastní drop zóna. */
  lightSurface?: boolean;
  /** Obsah slotu s přístupem k `isOver` (např. prémiová karta — zlatý stav při DnD). */
  renderContent?: (state: { isOver: boolean }) => ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const overCls = lightSurface
    ? "bg-cyan-100/90 ring-2 ring-cyan-500 ring-offset-2 ring-offset-white shadow-[0_0_28px_rgba(6,182,212,0.35)]"
    : "jersey-slot-dnd-highlight bg-[#c8102e]/10 ring-2 ring-[#c8102e]/85 ring-offset-2 ring-offset-[#05080f] shadow-[0_0_36px_rgba(200,16,46,0.35),0_0_52px_rgba(0,48,135,0.15)]";
  const content = renderContent ? renderContent({ isOver }) : children;
  return (
    <div
      ref={setNodeRef}
      className={`
        ${className}
        min-w-0 w-full rounded-2xl transition-[box-shadow,background-color] duration-200
        ${isOver ? overCls : ""}
      `}
    >
      {content}
    </div>
  );
}
