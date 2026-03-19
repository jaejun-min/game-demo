import { CANVAS_HEIGHT } from "./constants";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * AABB collision detection between two rectangles.
 */
export function checkAABB(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Check if a rect is outside the canvas boundaries (top or bottom).
 */
export function checkBoundaryCollision(rect: Rect): boolean {
  return rect.y < 0 || rect.y + rect.height > CANVAS_HEIGHT;
}

/**
 * Check if the plane collides with any pipe (top or bottom section).
 */
export function checkPipeCollision(
  planeRect: Rect,
  pipes: Array<{ getTopRect(): Rect; getBottomRect(): Rect }>
): boolean {
  for (const pipe of pipes) {
    if (checkAABB(planeRect, pipe.getTopRect())) return true;
    if (checkAABB(planeRect, pipe.getBottomRect())) return true;
  }
  return false;
}
