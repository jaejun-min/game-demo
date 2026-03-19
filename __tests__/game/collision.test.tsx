import { describe, it, expect } from "vitest";
import {
  checkAABB,
  checkBoundaryCollision,
  checkPipeCollision,
  Rect,
} from "@/lib/game/collision";
import { CANVAS_HEIGHT } from "@/lib/game/constants";

describe("Collision", () => {
  describe("checkAABB", () => {
    it("should detect overlapping rectangles", () => {
      const a: Rect = { x: 0, y: 0, width: 20, height: 20 };
      const b: Rect = { x: 10, y: 10, width: 20, height: 20 };
      expect(checkAABB(a, b)).toBe(true);
    });

    it("should not detect non-overlapping rectangles", () => {
      const a: Rect = { x: 0, y: 0, width: 20, height: 20 };
      const b: Rect = { x: 30, y: 30, width: 20, height: 20 };
      expect(checkAABB(a, b)).toBe(false);
    });

    it("should not detect adjacent (touching) rectangles as colliding", () => {
      const a: Rect = { x: 0, y: 0, width: 20, height: 20 };
      const b: Rect = { x: 20, y: 0, width: 20, height: 20 };
      expect(checkAABB(a, b)).toBe(false);
    });

    it("should detect one rect containing another", () => {
      const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
      const b: Rect = { x: 10, y: 10, width: 20, height: 20 };
      expect(checkAABB(a, b)).toBe(true);
    });
  });

  describe("checkBoundaryCollision", () => {
    it("should detect collision when y < 0 (top boundary)", () => {
      const rect: Rect = { x: 100, y: -5, width: 40, height: 30 };
      expect(checkBoundaryCollision(rect)).toBe(true);
    });

    it("should detect collision when y + height > CANVAS_HEIGHT (bottom boundary)", () => {
      const rect: Rect = {
        x: 100,
        y: CANVAS_HEIGHT - 10,
        width: 40,
        height: 30,
      };
      expect(checkBoundaryCollision(rect)).toBe(true);
    });

    it("should not detect collision when within bounds", () => {
      const rect: Rect = { x: 100, y: 100, width: 40, height: 30 };
      expect(checkBoundaryCollision(rect)).toBe(false);
    });

    it("should not detect collision when exactly touching boundaries", () => {
      const rect: Rect = { x: 100, y: 0, width: 40, height: 30 };
      expect(checkBoundaryCollision(rect)).toBe(false);
    });
  });

  describe("checkPipeCollision", () => {
    it("should detect collision with top pipe section", () => {
      const planeRect: Rect = { x: 200, y: 50, width: 40, height: 30 };
      const mockPipe = {
        getTopRect: () => ({ x: 190, y: 0, width: 60, height: 100 }),
        getBottomRect: () => ({ x: 190, y: 400, width: 60, height: 240 }),
      };
      expect(checkPipeCollision(planeRect, [mockPipe])).toBe(true);
    });

    it("should detect collision with bottom pipe section", () => {
      const planeRect: Rect = { x: 200, y: 420, width: 40, height: 30 };
      const mockPipe = {
        getTopRect: () => ({ x: 190, y: 0, width: 60, height: 100 }),
        getBottomRect: () => ({ x: 190, y: 400, width: 60, height: 240 }),
      };
      expect(checkPipeCollision(planeRect, [mockPipe])).toBe(true);
    });

    it("should not detect collision when plane passes through gap", () => {
      const planeRect: Rect = { x: 200, y: 200, width: 40, height: 30 };
      const mockPipe = {
        getTopRect: () => ({ x: 190, y: 0, width: 60, height: 100 }),
        getBottomRect: () => ({ x: 190, y: 400, width: 60, height: 240 }),
      };
      expect(checkPipeCollision(planeRect, [mockPipe])).toBe(false);
    });

    it("should return false with empty pipe array", () => {
      const planeRect: Rect = { x: 200, y: 200, width: 40, height: 30 };
      expect(checkPipeCollision(planeRect, [])).toBe(false);
    });
  });
});
