import { describe, it, expect, vi } from "vitest";
import { Pipe } from "@/lib/game/pipe";
import { PipeSpawner } from "@/lib/game/spawner";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PIPE_WIDTH,
  PIPE_GAP_SIZE,
  PIPE_SPAWN_INTERVAL,
} from "@/lib/game/constants";

describe("Pipe", () => {
  it("should create at x = CANVAS_WIDTH (right edge)", () => {
    const pipe = new Pipe(200);
    expect(pipe.x).toBe(CANVAS_WIDTH);
  });

  it("should have the specified gapY", () => {
    const pipe = new Pipe(250);
    expect(pipe.gapY).toBe(250);
  });

  it("should default to PIPE_GAP_SIZE", () => {
    const pipe = new Pipe(200);
    expect(pipe.gapSize).toBe(PIPE_GAP_SIZE);
  });

  it("should accept custom gap size", () => {
    const pipe = new Pipe(200, 120);
    expect(pipe.gapSize).toBe(120);
  });

  it("should move left on update(dt)", () => {
    const pipe = new Pipe(200);
    const initialX = pipe.x;
    const speed = 150;
    const dt = 0.016;

    pipe.update(dt, speed);
    expect(pipe.x).toBeCloseTo(initialX - speed * dt);
    expect(pipe.x).toBeLessThan(initialX);
  });

  it("should report off-screen when fully past left edge", () => {
    const pipe = new Pipe(200);
    pipe.x = -(PIPE_WIDTH + 1);
    expect(pipe.isOffScreen()).toBe(true);
  });

  it("should not be off-screen when still visible", () => {
    const pipe = new Pipe(200);
    expect(pipe.isOffScreen()).toBe(false);
  });

  it("should return correct top rect", () => {
    const pipe = new Pipe(200, 150);
    const top = pipe.getTopRect();
    expect(top.x).toBe(pipe.x);
    expect(top.y).toBe(0);
    expect(top.width).toBe(PIPE_WIDTH);
    expect(top.height).toBe(200); // gapY
  });

  it("should return correct bottom rect", () => {
    const pipe = new Pipe(200, 150);
    const bottom = pipe.getBottomRect();
    expect(bottom.x).toBe(pipe.x);
    expect(bottom.y).toBe(350); // gapY + gapSize
    expect(bottom.width).toBe(PIPE_WIDTH);
    expect(bottom.height).toBe(CANVAS_HEIGHT - 350);
  });

  it("should start with passed = false", () => {
    const pipe = new Pipe(200);
    expect(pipe.passed).toBe(false);
  });
});

describe("PipeSpawner", () => {
  it("should not spawn pipe before interval elapses", () => {
    const spawner = new PipeSpawner();
    const result = spawner.update(0.5, PIPE_GAP_SIZE);
    expect(result).toBeNull();
  });

  it("should spawn pipe when interval elapses", () => {
    const spawner = new PipeSpawner();
    const result = spawner.update(PIPE_SPAWN_INTERVAL, PIPE_GAP_SIZE);
    expect(result).toBeInstanceOf(Pipe);
    expect(result!.x).toBe(CANVAS_WIDTH);
  });

  it("should spawn pipe with correct gap size", () => {
    const spawner = new PipeSpawner();
    const customGap = 120;
    const result = spawner.update(PIPE_SPAWN_INTERVAL, customGap);
    expect(result).not.toBeNull();
    expect(result!.gapSize).toBe(customGap);
  });

  it("should spawn pipes at regular intervals with accumulated time", () => {
    const spawner = new PipeSpawner();
    // First few calls: not enough time
    expect(spawner.update(0.5, PIPE_GAP_SIZE)).toBeNull();
    expect(spawner.update(0.5, PIPE_GAP_SIZE)).toBeNull();
    expect(spawner.update(0.5, PIPE_GAP_SIZE)).toBeNull();
    // At 1.5s total, still under 1.8s interval
    expect(spawner.update(0.2, PIPE_GAP_SIZE)).toBeNull();
    // At 1.7s total, still under
    // At 1.8s+ should spawn
    const pipe = spawner.update(0.2, PIPE_GAP_SIZE);
    expect(pipe).toBeInstanceOf(Pipe);
  });

  it("should generate gapY within safe bounds", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const spawner = new PipeSpawner();
    const pipe = spawner.forceSpawn(PIPE_GAP_SIZE);
    expect(pipe.gapY).toBeGreaterThanOrEqual(50);
    expect(pipe.gapY + pipe.gapSize).toBeLessThanOrEqual(CANVAS_HEIGHT - 50);
    vi.restoreAllMocks();
  });

  it("should reset timer", () => {
    const spawner = new PipeSpawner();
    spawner.update(1.0, PIPE_GAP_SIZE); // accumulate time
    spawner.reset();
    // After reset, should need full interval again
    expect(spawner.update(0.5, PIPE_GAP_SIZE)).toBeNull();
  });
});
