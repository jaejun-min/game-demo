import { GRAVITY, MAX_DELTA } from "./constants";

export interface PhysicsBody {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
}

/**
 * Clamp raw delta time (in ms) to MAX_DELTA to prevent physics explosion
 * after tab suspension. Returns delta time in seconds.
 */
export function clampDelta(rawDeltaMs: number): number {
  const clampedMs = Math.max(0, Math.min(rawDeltaMs, MAX_DELTA));
  return clampedMs / 1000;
}

/**
 * Apply gravity to a physics body's velocity.
 */
export function applyGravity(body: PhysicsBody, dt: number): void {
  body.velocityY += GRAVITY * dt;
}

/**
 * Update position based on velocity and delta time.
 */
export function updatePosition(body: PhysicsBody, dt: number): void {
  body.x += body.velocityX * dt;
  body.y += body.velocityY * dt;
}

/**
 * Full physics step: apply gravity then update position.
 */
export function physicsStep(body: PhysicsBody, dt: number): void {
  applyGravity(body, dt);
  updatePosition(body, dt);
}
