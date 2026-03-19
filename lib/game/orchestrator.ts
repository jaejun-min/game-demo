import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { GameLoop } from "./engine";
import { InputSystem } from "./input";
import { Plane } from "./plane";
import { Pipe } from "./pipe";
import { PipeSpawner } from "./spawner";
import { ScoreSystem } from "./score";
import { DifficultySystem } from "./difficulty";
import { ThemeSystem } from "./theme";
import { Renderer } from "./renderer";
import { checkPipeCollision, checkBoundaryCollision } from "./collision";
import { GameState, type GameStateType } from "./state";

export interface OrchestratorCallbacks {
  onScoreChange?: (score: number) => void;
  onGameOver?: (finalScore: number) => void;
  onStateChange?: (state: GameStateType) => void;
}

export class GameOrchestrator {
  private gameLoop: GameLoop | null = null;
  private inputSystem: InputSystem | null = null;
  private plane: Plane;
  private pipes: Pipe[] = [];
  private pipeSpawner: PipeSpawner;
  private scoreSystem: ScoreSystem;
  private difficultySystem: DifficultySystem;
  private themeSystem: ThemeSystem;
  private renderer: Renderer | null = null;
  private gameState: GameState;
  private elapsedTime: number = 0;
  private hasFlapped: boolean = false;
  private callbacks: OrchestratorCallbacks = {};
  private unsubscribeState: (() => void) | null = null;

  constructor() {
    this.plane = new Plane();
    this.pipeSpawner = new PipeSpawner();
    this.scoreSystem = new ScoreSystem();
    this.difficultySystem = new DifficultySystem();
    this.themeSystem = new ThemeSystem();
    this.gameState = new GameState();
  }

  init(
    canvas: HTMLCanvasElement,
    callbacks: OrchestratorCallbacks = {},
  ): void {
    this.callbacks = callbacks;

    // Set canvas internal resolution
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2d context");

    this.renderer = new Renderer(ctx, this.themeSystem);
    this.inputSystem = new InputSystem(document, canvas);

    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render(),
    );

    // Listen for state changes
    this.unsubscribeState = this.gameState.onChange((state) => {
      this.callbacks.onStateChange?.(state);

      if (state === "playing") {
        this.gameLoop?.start();
      } else if (state === "paused") {
        this.gameLoop?.stop();
      } else if (state === "gameover") {
        this.gameLoop?.stop();
      }
    });

    // Setup auto-pause on tab visibility change
    this.gameState.setupVisibilityListener();
  }

  start(): void {
    this.resetGame();
    this.gameState.play();
  }

  resume(): void {
    this.gameState.resume();
  }

  getState(): GameStateType {
    return this.gameState.state;
  }

  getScore(): number {
    return this.scoreSystem.score;
  }

  cleanup(): void {
    this.gameLoop?.stop();
    this.inputSystem?.cleanup();
    this.gameState.cleanupVisibilityListener();
    this.unsubscribeState?.();
    this.unsubscribeState = null;
  }

  private resetGame(): void {
    this.plane.reset();
    this.pipes = [];
    this.pipeSpawner.reset();
    this.scoreSystem.reset();
    this.elapsedTime = 0;
    this.hasFlapped = false;
    this.inputSystem?.reset();
  }

  private update(dt: number): void {
    if (this.gameState.state !== "playing") return;

    this.elapsedTime += dt;

    // 1. Process input
    if (this.inputSystem?.consumeFlap()) {
      this.hasFlapped = true;
      this.plane.flap();
    }

    // Before first flap: freeze the plane, show guide
    if (!this.hasFlapped) {
      return;
    }

    // 2. Update physics
    this.plane.update(dt);

    // 3. Get current difficulty
    const scrollSpeed = this.difficultySystem.getScrollSpeed(this.elapsedTime);
    const gapSize = this.difficultySystem.getGapSize(this.scoreSystem.score);

    // 4. Spawn pipes
    const newPipe = this.pipeSpawner.update(dt, gapSize);
    if (newPipe) {
      this.pipes.push(newPipe);
    }

    // 5. Update pipes
    for (const pipe of this.pipes) {
      pipe.update(dt, scrollSpeed);
    }

    // Remove off-screen pipes
    this.pipes = this.pipes.filter((p) => !p.isOffScreen());

    // 6. Check collisions
    const planeRect = {
      x: this.plane.x,
      y: this.plane.y,
      width: this.plane.width,
      height: this.plane.height,
    };

    if (
      checkBoundaryCollision(planeRect) ||
      checkPipeCollision(planeRect, this.pipes)
    ) {
      this.gameState.gameOver();
      this.callbacks.onGameOver?.(this.scoreSystem.score);
      return;
    }

    // 7. Update score
    const passedIndices = this.scoreSystem.update(this.plane.x, this.pipes);
    for (const idx of passedIndices) {
      this.pipes[idx].passed = true;
    }
    if (passedIndices.length > 0) {
      this.callbacks.onScoreChange?.(this.scoreSystem.score);
    }
  }

  private render(): void {
    if (!this.renderer) return;
    this.renderer.render(this.plane, this.pipes, this.scoreSystem.score, !this.hasFlapped);
  }
}
