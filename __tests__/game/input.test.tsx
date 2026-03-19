import { describe, it, expect, afterEach } from "vitest";
import { InputSystem } from "@/lib/game/input";
import { FLAP_COOLDOWN } from "@/lib/game/constants";

describe("InputSystem", () => {
  let input: InputSystem;

  afterEach(() => {
    input?.cleanup();
  });

  it("should set isFlapping to true on spacebar keydown", () => {
    input = new InputSystem(document);

    expect(input.isFlapping).toBe(false);
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    expect(input.isFlapping).toBe(true);
  });

  it("should set isFlapping to false on spacebar keyup", () => {
    input = new InputSystem(document);

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    expect(input.isFlapping).toBe(true);
    document.dispatchEvent(new KeyboardEvent("keyup", { code: "Space" }));
    expect(input.isFlapping).toBe(false);
  });

  it("should not change isFlapping for non-space keys", () => {
    input = new InputSystem(document);

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp" }));
    expect(input.isFlapping).toBe(false);
  });

  it("should set isFlapping to true on touchstart", () => {
    input = new InputSystem(document);

    document.dispatchEvent(new Event("touchstart"));
    expect(input.isFlapping).toBe(true);
  });

  it("should set isFlapping to false on touchend", () => {
    input = new InputSystem(document);

    document.dispatchEvent(new Event("touchstart"));
    expect(input.isFlapping).toBe(true);
    document.dispatchEvent(new Event("touchend"));
    expect(input.isFlapping).toBe(false);
  });

  it("should remove event listeners on cleanup", () => {
    input = new InputSystem(document);

    input.cleanup();

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    expect(input.isFlapping).toBe(false);
  });

  it("should reset isFlapping state", () => {
    input = new InputSystem(document);

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    expect(input.isFlapping).toBe(true);
    input.reset();
    expect(input.isFlapping).toBe(false);
  });

  describe("consumeFlap - edge detection (C1)", () => {
    it("should return true once per keydown press", () => {
      input = new InputSystem(document);

      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      expect(input.consumeFlap(1000)).toBe(true);
    });

    it("should return false on second call without keyup+keydown", () => {
      input = new InputSystem(document);

      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      expect(input.consumeFlap(1000)).toBe(true);
      // Still holding space - no keyup
      expect(input.consumeFlap(2000)).toBe(false);
    });

    it("should return true again after keyup + keydown cycle", () => {
      input = new InputSystem(document);

      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      expect(input.consumeFlap(1000)).toBe(true);

      document.dispatchEvent(new KeyboardEvent("keyup", { code: "Space" }));
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      expect(input.consumeFlap(2000)).toBe(true);
    });

    it("hold spacebar: consumeFlap returns true only once, then false until keyup+keydown", () => {
      input = new InputSystem(document);

      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      expect(input.consumeFlap(1000)).toBe(true);
      // Simulating holding - repeated keydown events without keyup
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      expect(input.consumeFlap(2000)).toBe(false);
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      expect(input.consumeFlap(3000)).toBe(false);

      // Release and press again
      document.dispatchEvent(new KeyboardEvent("keyup", { code: "Space" }));
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      expect(input.consumeFlap(4000)).toBe(true);
    });
  });

  describe("consumeFlap - cooldown (C2)", () => {
    it("rapid taps within 150ms: second consumeFlap returns false", () => {
      input = new InputSystem(document);

      // First tap
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      expect(input.consumeFlap(1000)).toBe(true);
      document.dispatchEvent(new KeyboardEvent("keyup", { code: "Space" }));

      // Second tap within cooldown (1000 + 100 < 1000 + 150)
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      expect(input.consumeFlap(1000 + 100)).toBe(false);
    });

    it("tap after 150ms: consumeFlap returns true", () => {
      input = new InputSystem(document);

      // First tap
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      expect(input.consumeFlap(1000)).toBe(true);
      document.dispatchEvent(new KeyboardEvent("keyup", { code: "Space" }));

      // Second tap after cooldown
      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      expect(input.consumeFlap(1000 + FLAP_COOLDOWN)).toBe(true);
    });

    it("consumeFlap returns false if no flap pending", () => {
      input = new InputSystem(document);
      expect(input.consumeFlap(1000)).toBe(false);
    });
  });

  describe("touch target separation (W5)", () => {
    it("should attach touch events to touchTarget when provided", () => {
      // Use document as the keyboard target, create a div for touch target
      const touchDiv = document.createElement("div");
      document.body.appendChild(touchDiv);
      input = new InputSystem(document, touchDiv);

      // Touch on touchDiv should work
      touchDiv.dispatchEvent(new Event("touchstart"));
      expect(input.isFlapping).toBe(true);
      touchDiv.dispatchEvent(new Event("touchend"));
      expect(input.isFlapping).toBe(false);

      document.body.removeChild(touchDiv);
    });

    it("keyboard events should still go to the main target", () => {
      const touchDiv = document.createElement("div");
      document.body.appendChild(touchDiv);
      input = new InputSystem(document, touchDiv);

      document.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      expect(input.isFlapping).toBe(true);

      document.body.removeChild(touchDiv);
    });

    it("touch events on main target should NOT trigger when touchTarget is separate", () => {
      const touchDiv = document.createElement("div");
      document.body.appendChild(touchDiv);
      input = new InputSystem(document, touchDiv);

      // Touch on document (not touchDiv) should NOT work
      document.dispatchEvent(new Event("touchstart"));
      expect(input.isFlapping).toBe(false);

      document.body.removeChild(touchDiv);
    });

    it("should cleanup touch events from touchTarget", () => {
      const touchDiv = document.createElement("div");
      document.body.appendChild(touchDiv);
      input = new InputSystem(document, touchDiv);

      input.cleanup();

      touchDiv.dispatchEvent(new Event("touchstart"));
      expect(input.isFlapping).toBe(false);

      document.body.removeChild(touchDiv);
    });
  });
});
