import { FLAP_COOLDOWN } from "./constants";

export class InputSystem {
  private _isFlapping: boolean = false;
  private _flapPending: boolean = false;
  private _lastFlapTime: number = 0;
  private target: EventTarget;
  private touchTarget: EventTarget;

  private handleKeyDown: (e: Event) => void;
  private handleKeyUp: (e: Event) => void;
  private handleTouchStart: (e: Event) => void;
  private handleTouchEnd: (e: Event) => void;
  private handleMouseDown: (e: Event) => void;
  private handleMouseUp: (e: Event) => void;

  constructor(
    target: EventTarget = typeof document !== "undefined" ? document : new EventTarget(),
    touchTarget?: EventTarget,
  ) {
    this.target = target;
    this.touchTarget = touchTarget ?? target;

    this.handleKeyDown = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.code === "Space") {
        e.preventDefault();
        if (!this._isFlapping) {
          this._isFlapping = true;
          this._flapPending = true;
        }
      }
    };

    this.handleKeyUp = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.code === "Space") {
        this._isFlapping = false;
      }
    };

    this.handleTouchStart = (e: Event) => {
      e.preventDefault();
      if (!this._isFlapping) {
        this._isFlapping = true;
        this._flapPending = true;
      }
    };

    this.handleTouchEnd = (_e: Event) => {
      this._isFlapping = false;
    };

    this.handleMouseDown = (e: Event) => {
      const me = e as MouseEvent;
      if (me.button === 0) {
        e.preventDefault();
        if (!this._isFlapping) {
          this._isFlapping = true;
          this._flapPending = true;
        }
      }
    };

    this.handleMouseUp = (e: Event) => {
      const me = e as MouseEvent;
      if (me.button === 0) {
        this._isFlapping = false;
      }
    };

    this.target.addEventListener("keydown", this.handleKeyDown);
    this.target.addEventListener("keyup", this.handleKeyUp);
    this.touchTarget.addEventListener("touchstart", this.handleTouchStart);
    this.touchTarget.addEventListener("touchend", this.handleTouchEnd);
    this.touchTarget.addEventListener("mousedown", this.handleMouseDown);
    this.touchTarget.addEventListener("mouseup", this.handleMouseUp);
  }

  get isFlapping(): boolean {
    return this._isFlapping;
  }

  /**
   * Returns true once per press if cooldown has elapsed, then requires key-up before firing again.
   */
  consumeFlap(now: number = Date.now()): boolean {
    if (!this._flapPending) return false;
    if (now - this._lastFlapTime < FLAP_COOLDOWN) return false;
    this._flapPending = false;
    this._lastFlapTime = now;
    return true;
  }

  reset(): void {
    this._isFlapping = false;
    this._flapPending = false;
    this._lastFlapTime = 0;
  }

  cleanup(): void {
    this.target.removeEventListener("keydown", this.handleKeyDown);
    this.target.removeEventListener("keyup", this.handleKeyUp);
    this.touchTarget.removeEventListener("touchstart", this.handleTouchStart);
    this.touchTarget.removeEventListener("touchend", this.handleTouchEnd);
    this.touchTarget.removeEventListener("mousedown", this.handleMouseDown);
    this.touchTarget.removeEventListener("mouseup", this.handleMouseUp);
  }
}
