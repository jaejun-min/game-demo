import { CANVAS_WIDTH, CANVAS_HEIGHT, PIPE_WIDTH, PIPE_GAP_SIZE } from "./constants";

export interface PipeState {
  x: number;
  gapY: number;
  gapSize: number;
  width: number;
  passed: boolean;
}

export class Pipe {
  x: number;
  gapY: number;
  gapSize: number;
  width: number;
  passed: boolean;

  constructor(gapY: number, gapSize: number = PIPE_GAP_SIZE) {
    this.x = CANVAS_WIDTH;
    this.gapY = gapY;
    this.gapSize = gapSize;
    this.width = PIPE_WIDTH;
    this.passed = false;
  }

  update(dt: number, scrollSpeed: number): void {
    this.x -= scrollSpeed * dt;
  }

  isOffScreen(): boolean {
    return this.x + this.width < 0;
  }

  /** Get the top pipe rect (from top of canvas to top of gap) */
  getTopRect(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: 0,
      width: this.width,
      height: this.gapY,
    };
  }

  /** Get the bottom pipe rect (from bottom of gap to bottom of canvas) */
  getBottomRect(): { x: number; y: number; width: number; height: number } {
    const bottomY = this.gapY + this.gapSize;
    return {
      x: this.x,
      y: bottomY,
      width: this.width,
      height: CANVAS_HEIGHT - bottomY,
    };
  }

  getState(): PipeState {
    return {
      x: this.x,
      gapY: this.gapY,
      gapSize: this.gapSize,
      width: this.width,
      passed: this.passed,
    };
  }
}
