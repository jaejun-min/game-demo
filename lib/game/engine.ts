import { clampDelta } from "./physics";

export type UpdateCallback = (dt: number) => void;
export type RenderCallback = () => void;

export class GameLoop {
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private running: boolean = false;
  private onUpdate: UpdateCallback;
  private onRender: RenderCallback;

  constructor(onUpdate: UpdateCallback, onRender: RenderCallback) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = 0;
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  private loop = (timestamp: number): void => {
    if (!this.running) return;

    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      this.animationFrameId = requestAnimationFrame(this.loop);
      return;
    }

    const rawDeltaMs = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // clampDelta returns seconds, clamped to MAX_DELTA ms
    const dt = clampDelta(rawDeltaMs);

    this.onUpdate(dt);
    this.onRender();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };
}
