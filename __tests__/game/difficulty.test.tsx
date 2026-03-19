import { describe, it, expect } from "vitest";
import { DifficultySystem } from "@/lib/game/difficulty";
import {
  PIPE_SCROLL_SPEED,
  PIPE_GAP_SIZE,
  MAX_SPEED,
  MIN_GAP,
  SPEED_INCREASE_RATE,
  GAP_DECREASE_RATE,
} from "@/lib/game/constants";

describe("DifficultySystem", () => {
  const difficulty = new DifficultySystem();

  describe("getScrollSpeed", () => {
    it("should return base speed at time 0", () => {
      expect(difficulty.getScrollSpeed(0)).toBe(PIPE_SCROLL_SPEED);
    });

    it("should increase speed with elapsed time", () => {
      const earlySpeed = difficulty.getScrollSpeed(5);
      const lateSpeed = difficulty.getScrollSpeed(20);
      expect(lateSpeed).toBeGreaterThan(earlySpeed);
    });

    it("should increase at the correct rate", () => {
      const elapsed = 10;
      const expected = PIPE_SCROLL_SPEED + SPEED_INCREASE_RATE * elapsed;
      expect(difficulty.getScrollSpeed(elapsed)).toBeCloseTo(expected);
    });

    it("should cap at MAX_SPEED", () => {
      const veryLateTime = 1000;
      expect(difficulty.getScrollSpeed(veryLateTime)).toBe(MAX_SPEED);
    });

    it("should not exceed MAX_SPEED even with more time", () => {
      const time1 = 500;
      const time2 = 1000;
      expect(difficulty.getScrollSpeed(time1)).toBe(MAX_SPEED);
      expect(difficulty.getScrollSpeed(time2)).toBe(MAX_SPEED);
    });
  });

  describe("getGapSize", () => {
    it("should return base gap size at score 0", () => {
      expect(difficulty.getGapSize(0)).toBe(PIPE_GAP_SIZE);
    });

    it("should decrease gap with score", () => {
      const lowScoreGap = difficulty.getGapSize(5);
      const highScoreGap = difficulty.getGapSize(30);
      expect(highScoreGap).toBeLessThan(lowScoreGap);
    });

    it("should decrease at the correct rate", () => {
      const score = 10;
      const expected = PIPE_GAP_SIZE - GAP_DECREASE_RATE * score;
      expect(difficulty.getGapSize(score)).toBeCloseTo(expected);
    });

    it("should cap at MIN_GAP", () => {
      const veryHighScore = 1000;
      expect(difficulty.getGapSize(veryHighScore)).toBe(MIN_GAP);
    });

    it("should not go below MIN_GAP even with higher score", () => {
      const score1 = 100;
      const score2 = 200;
      expect(difficulty.getGapSize(score1)).toBe(MIN_GAP);
      expect(difficulty.getGapSize(score2)).toBe(MIN_GAP);
    });
  });
});
