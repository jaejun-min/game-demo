import { describe, it, expect } from "vitest";
import {
  clampDelta,
  applyGravity,
  updatePosition,
  physicsStep,
  PhysicsBody,
} from "@/lib/game/physics";
import { GRAVITY, MAX_DELTA } from "@/lib/game/constants";

describe("Physics", () => {
  describe("clampDelta", () => {
    it("should convert 16ms to 0.016 seconds", () => {
      expect(clampDelta(16)).toBeCloseTo(0.016);
    });

    it("should clamp 2000ms to MAX_DELTA (50ms) = 0.05 seconds", () => {
      expect(clampDelta(2000)).toBeCloseTo(MAX_DELTA / 1000);
    });

    it("should not clamp values below MAX_DELTA", () => {
      expect(clampDelta(33)).toBeCloseTo(0.033);
    });

    it("should clamp exactly at MAX_DELTA", () => {
      expect(clampDelta(50)).toBeCloseTo(0.05);
    });

    it("should clamp negative delta to 0", () => {
      expect(clampDelta(-100)).toBe(0);
    });

    it("should return 0 for delta of -1", () => {
      expect(clampDelta(-1)).toBe(0);
    });
  });

  describe("applyGravity", () => {
    it("should increase velocityY by GRAVITY * dt", () => {
      const body: PhysicsBody = { x: 0, y: 0, velocityX: 0, velocityY: 0 };
      applyGravity(body, 0.016);
      expect(body.velocityY).toBeCloseTo(GRAVITY * 0.016);
    });
  });

  describe("updatePosition", () => {
    it("should update position based on velocity and dt", () => {
      const body: PhysicsBody = {
        x: 100,
        y: 200,
        velocityX: 50,
        velocityY: 100,
      };
      updatePosition(body, 0.016);
      expect(body.x).toBeCloseTo(100 + 50 * 0.016);
      expect(body.y).toBeCloseTo(200 + 100 * 0.016);
    });
  });

  describe("physicsStep", () => {
    it("should apply gravity and then update position", () => {
      const body: PhysicsBody = {
        x: 100,
        y: 200,
        velocityX: 0,
        velocityY: 0,
      };
      const dt = 0.016;
      physicsStep(body, dt);

      // After gravity: velocityY = GRAVITY * dt
      const expectedVelocityY = GRAVITY * dt;
      expect(body.velocityY).toBeCloseTo(expectedVelocityY);
      // Position: y = 200 + expectedVelocityY * dt
      expect(body.y).toBeCloseTo(200 + expectedVelocityY * dt);
    });

    it("delta time 16ms: position = previous + velocity * 0.016", () => {
      const body: PhysicsBody = {
        x: 0,
        y: 0,
        velocityX: 100,
        velocityY: 200,
      };
      const prevX = body.x;
      const prevY = body.y;
      const vx = body.velocityX;
      updatePosition(body, 0.016);
      expect(body.x).toBeCloseTo(prevX + vx * 0.016);
    });

    it("delta time 2000ms clamped to 50ms: position = previous + velocity * 0.05", () => {
      const body: PhysicsBody = {
        x: 0,
        y: 0,
        velocityX: 100,
        velocityY: 0,
      };
      const dt = clampDelta(2000); // 0.05
      updatePosition(body, dt);
      expect(body.x).toBeCloseTo(0 + 100 * 0.05);
    });
  });
});
