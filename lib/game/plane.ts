import {
  GRAVITY,
  FLAP_FORCE,
  PLANE_WIDTH,
  PLANE_HEIGHT,
  PLANE_START_X,
  PLANE_START_Y,
  MAX_FALL_SPEED,
} from "./constants";

export interface PlaneState {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
}

export class Plane {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;

  constructor() {
    this.x = PLANE_START_X;
    this.y = PLANE_START_Y;
    this.width = PLANE_WIDTH;
    this.height = PLANE_HEIGHT;
    this.velocityY = 0;
  }

  flap(): void {
    this.velocityY = FLAP_FORCE;
  }

  update(dt: number): void {
    // Semi-implicit Euler: update velocity first, then position
    this.velocityY += GRAVITY * dt;
    this.velocityY = Math.min(this.velocityY, MAX_FALL_SPEED);
    this.y += this.velocityY * dt;
  }

  reset(): void {
    this.x = PLANE_START_X;
    this.y = PLANE_START_Y;
    this.velocityY = 0;
  }

  getState(): PlaneState {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      velocityY: this.velocityY,
    };
  }
}
