import { describe, it, expect, vi } from "vitest";
import { GameState } from "@/lib/game/state";

describe("GameState", () => {
  it('should initialize with state "start"', () => {
    const gs = new GameState();
    expect(gs.state).toBe("start");
  });

  it('play() should transition to "playing" from "start"', () => {
    const gs = new GameState();
    gs.play();
    expect(gs.state).toBe("playing");
  });

  it('pause() should transition to "paused" from "playing"', () => {
    const gs = new GameState();
    gs.play();
    gs.pause();
    expect(gs.state).toBe("paused");
  });

  it('resume() should transition to "playing" from "paused"', () => {
    const gs = new GameState();
    gs.play();
    gs.pause();
    gs.resume();
    expect(gs.state).toBe("playing");
  });

  it('gameOver() should transition to "gameover" from "playing"', () => {
    const gs = new GameState();
    gs.play();
    gs.gameOver();
    expect(gs.state).toBe("gameover");
  });

  it('reset() should transition back to "start"', () => {
    const gs = new GameState();
    gs.play();
    gs.gameOver();
    gs.reset();
    expect(gs.state).toBe("start");
  });

  it("should not pause if not playing", () => {
    const gs = new GameState();
    gs.pause();
    expect(gs.state).toBe("start"); // unchanged
  });

  it("should not game over if not playing", () => {
    const gs = new GameState();
    gs.gameOver();
    expect(gs.state).toBe("start"); // unchanged
  });

  it("should call onChange callback on state transitions", () => {
    const gs = new GameState();
    const callback = vi.fn();
    gs.onChange(callback);

    gs.play();
    expect(callback).toHaveBeenCalledWith("playing");

    gs.pause();
    expect(callback).toHaveBeenCalledWith("paused");
  });

  describe("visibilitychange auto-pause", () => {
    it("should pause when document becomes hidden during gameplay", () => {
      const gs = new GameState();
      const mockDoc = {
        hidden: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as Document;

      gs.setupVisibilityListener(mockDoc);
      gs.play();

      // Simulate document becoming hidden
      (mockDoc as { hidden: boolean }).hidden = true;
      const handler = (mockDoc.addEventListener as ReturnType<typeof vi.fn>)
        .mock.calls[0][1] as () => void;
      handler();

      expect(gs.state).toBe("paused");
    });

    it("should stay paused when document becomes visible again", () => {
      const gs = new GameState();
      const mockDoc = {
        hidden: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as Document;

      gs.setupVisibilityListener(mockDoc);
      gs.play();

      // Hide
      (mockDoc as { hidden: boolean }).hidden = true;
      const handler = (mockDoc.addEventListener as ReturnType<typeof vi.fn>)
        .mock.calls[0][1] as () => void;
      handler();
      expect(gs.state).toBe("paused");

      // Show again
      (mockDoc as { hidden: boolean }).hidden = false;
      handler();
      expect(gs.state).toBe("paused"); // stays paused
    });

    it("should not pause if not playing when tab becomes hidden", () => {
      const gs = new GameState();
      const mockDoc = {
        hidden: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as Document;

      gs.setupVisibilityListener(mockDoc);
      // Don't call play() - still in "start" state

      (mockDoc as { hidden: boolean }).hidden = true;
      const handler = (mockDoc.addEventListener as ReturnType<typeof vi.fn>)
        .mock.calls[0][1] as () => void;
      handler();

      expect(gs.state).toBe("start"); // unchanged
    });

    it("should remove listener on cleanup", () => {
      const gs = new GameState();
      const mockDoc = {
        hidden: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as Document;

      gs.setupVisibilityListener(mockDoc);
      gs.cleanupVisibilityListener(mockDoc);

      expect(mockDoc.removeEventListener).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function)
      );
    });
  });

  it("onChange should return an unsubscribe function", () => {
    const gs = new GameState();
    const callback = vi.fn();
    const unsubscribe = gs.onChange(callback);

    gs.play();
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();

    gs.pause();
    // callback should NOT be called again after unsubscribe
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("unsubscribe should only remove the specific callback", () => {
    const gs = new GameState();
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const unsub1 = gs.onChange(cb1);
    gs.onChange(cb2);

    gs.play();
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);

    unsub1();

    gs.pause();
    expect(cb1).toHaveBeenCalledTimes(1); // not called again
    expect(cb2).toHaveBeenCalledTimes(2); // still called
  });

  it('play() from "paused" should transition to "playing"', () => {
    const gs = new GameState();
    gs.play(); // start -> playing
    gs.pause(); // playing -> paused
    gs.play(); // paused -> playing
    expect(gs.state).toBe("playing");
  });
});
