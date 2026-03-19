import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GameLoop } from "@/lib/game/engine";

describe("GameLoop", () => {
  let mockRAF: ReturnType<typeof vi.fn>;
  let mockCancelRAF: ReturnType<typeof vi.fn>;
  let rafCallback: ((timestamp: number) => void) | null = null;

  beforeEach(() => {
    let rafId = 0;
    mockRAF = vi.fn((cb: FrameRequestCallback) => {
      rafCallback = cb;
      return ++rafId;
    });
    mockCancelRAF = vi.fn();

    vi.stubGlobal("requestAnimationFrame", mockRAF);
    vi.stubGlobal("cancelAnimationFrame", mockCancelRAF);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    rafCallback = null;
  });

  it("should start and stop the loop", () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(update, render);

    loop.start();
    expect(loop.isRunning()).toBe(true);
    expect(mockRAF).toHaveBeenCalledTimes(1);

    loop.stop();
    expect(loop.isRunning()).toBe(false);
    expect(mockCancelRAF).toHaveBeenCalled();
  });

  it("should not call update on the first frame (initializing lastTimestamp)", () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(update, render);

    loop.start();
    // Simulate first frame
    rafCallback!(1000);

    expect(update).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();
  });

  it("should call update with delta time in seconds on subsequent frames", () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(update, render);

    loop.start();
    // First frame: sets lastTimestamp
    rafCallback!(1000);
    // Second frame: 16ms later
    rafCallback!(1016);

    expect(update).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledTimes(1);
    // dt should be 16ms / 1000 = 0.016s
    expect(update.mock.calls[0][0]).toBeCloseTo(0.016);
  });

  it("should clamp delta time to 50ms (0.05s)", () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(update, render);

    loop.start();
    rafCallback!(1000);
    // Simulate 2000ms gap (tab suspension)
    rafCallback!(3000);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0]).toBeCloseTo(0.05);
  });

  it("should not start if already running", () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(update, render);

    loop.start();
    loop.start(); // second call should be ignored
    expect(mockRAF).toHaveBeenCalledTimes(1);
  });
});
