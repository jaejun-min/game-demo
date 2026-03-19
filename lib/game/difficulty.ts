import {
  PIPE_SCROLL_SPEED,
  PIPE_GAP_SIZE,
  MAX_SPEED,
  MIN_GAP,
  SPEED_INCREASE_RATE,
  GAP_DECREASE_RATE,
} from "./constants";

export class DifficultySystem {
  /**
   * Calculate current scroll speed based on elapsed time.
   * Speed increases linearly with time, capped at MAX_SPEED.
   */
  getScrollSpeed(elapsedTime: number): number {
    const speed = PIPE_SCROLL_SPEED + SPEED_INCREASE_RATE * elapsedTime;
    return Math.min(speed, MAX_SPEED);
  }

  /**
   * Calculate current gap size based on score.
   * Gap decreases linearly with score, capped at MIN_GAP.
   */
  getGapSize(score: number): number {
    const gap = PIPE_GAP_SIZE - GAP_DECREASE_RATE * score;
    return Math.max(gap, MIN_GAP);
  }
}
