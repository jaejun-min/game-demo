import { describe, it, expect } from "vitest";
import { Plane } from "@/lib/game/plane";
import { FLAP_FORCE, GRAVITY, PLANE_START_X, PLANE_START_Y, MAX_FALL_SPEED } from "@/lib/game/constants";

describe("Plane", () => {
  it("should initialize at start position", () => {
    const plane = new Plane();
    expect(plane.x).toBe(PLANE_START_X);
    expect(plane.y).toBe(PLANE_START_Y);
    expect(plane.velocityY).toBe(0);
  });

  it("should set velocityY to FLAP_FORCE (negative/upward) on flap()", () => {
    const plane = new Plane();
    plane.flap();
    expect(plane.velocityY).toBe(FLAP_FORCE);
    expect(plane.velocityY).toBeLessThan(0); // upward
  });

  it("should apply gravity on update(dt) causing downward movement", () => {
    const plane = new Plane();
    const initialY = plane.y;
    const dt = 0.016;

    plane.update(dt);

    // Velocity increases downward due to gravity
    expect(plane.velocityY).toBeCloseTo(GRAVITY * dt);
    // Position moves down
    expect(plane.y).toBeGreaterThan(initialY);
  });

  it("should move upward after flap then update", () => {
    const plane = new Plane();
    const initialY = plane.y;

    plane.flap();
    plane.update(0.016);

    // After flap, velocity is FLAP_FORCE + GRAVITY * dt
    // FLAP_FORCE is negative (upward), GRAVITY * dt is small positive
    // Net velocity should still be negative (upward)
    expect(plane.velocityY).toBeLessThan(0);
    expect(plane.y).toBeLessThan(initialY);
  });

  it("should reset to initial state", () => {
    const plane = new Plane();
    plane.flap();
    plane.update(0.5);

    plane.reset();
    expect(plane.x).toBe(PLANE_START_X);
    expect(plane.y).toBe(PLANE_START_Y);
    expect(plane.velocityY).toBe(0);
  });

  it("should clamp velocityY at MAX_FALL_SPEED (terminal velocity)", () => {
    const plane = new Plane();
    // Apply many updates to build up a large downward velocity
    for (let i = 0; i < 100; i++) {
      plane.update(0.1);
    }
    expect(plane.velocityY).toBe(MAX_FALL_SPEED);
    expect(plane.velocityY).toBeLessThanOrEqual(MAX_FALL_SPEED);
  });

  it("should not clamp upward velocity", () => {
    const plane = new Plane();
    plane.flap();
    plane.update(0.001); // tiny dt so gravity barely affects
    expect(plane.velocityY).toBeLessThan(0); // still negative/upward
  });

  it("should return correct state from getState()", () => {
    const plane = new Plane();
    const state = plane.getState();
    expect(state.x).toBe(plane.x);
    expect(state.y).toBe(plane.y);
    expect(state.width).toBe(plane.width);
    expect(state.height).toBe(plane.height);
    expect(state.velocityY).toBe(plane.velocityY);
  });
});
