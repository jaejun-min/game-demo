export type GameStateType = "start" | "playing" | "paused" | "gameover";

export type StateChangeCallback = (state: GameStateType) => void;

export class GameState {
  private _state: GameStateType = "start";
  private onChangeCallbacks: StateChangeCallback[] = [];
  private handleVisibilityChange: (() => void) | null = null;

  get state(): GameStateType {
    return this._state;
  }

  play(): void {
    if (this._state === "start" || this._state === "paused") {
      this.setState("playing");
    }
  }

  pause(): void {
    if (this._state === "playing") {
      this.setState("paused");
    }
  }

  resume(): void {
    if (this._state === "paused") {
      this.setState("playing");
    }
  }

  gameOver(): void {
    if (this._state === "playing") {
      this.setState("gameover");
    }
  }

  reset(): void {
    this.setState("start");
  }

  onChange(callback: StateChangeCallback): () => void {
    this.onChangeCallbacks.push(callback);
    return () => {
      this.onChangeCallbacks = this.onChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Set up visibilitychange listener for auto-pause.
   * When the document becomes hidden during gameplay, pause the game.
   * When the document becomes visible again, keep the game paused (user must resume manually).
   */
  setupVisibilityListener(doc: Document = document): void {
    this.handleVisibilityChange = () => {
      if (doc.hidden && this._state === "playing") {
        this.pause();
      }
      // When visible again, stay paused - user must explicitly resume
    };

    doc.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  cleanupVisibilityListener(doc: Document = document): void {
    if (this.handleVisibilityChange) {
      doc.removeEventListener("visibilitychange", this.handleVisibilityChange);
      this.handleVisibilityChange = null;
    }
  }

  private setState(newState: GameStateType): void {
    this._state = newState;
    for (const cb of this.onChangeCallbacks) {
      cb(newState);
    }
  }
}
