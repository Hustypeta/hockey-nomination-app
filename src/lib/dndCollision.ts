import { pointerWithin, rectIntersection, type CollisionDetection } from "@dnd-kit/core";

/** Nejprve trefa přímo kurzorem/dotykem — spolehlivější při přetahování karet na sloty. */
export const poolToSlotCollision: CollisionDetection = (args) => {
  const pw = pointerWithin(args);
  if (pw.length > 0) return pw;
  return rectIntersection(args);
};
