"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { GameOrchestrator } from "@/lib/game/orchestrator";
import type { GameStateType } from "@/lib/game/state";

interface GameCanvasProps {
  onScoreChange?: (score: number) => void;
  onGameOver?: (finalScore: number) => void;
  onStateChange?: (state: GameStateType) => void;
}

export interface GameCanvasHandle {
  resume: () => void;
}

export const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
  function GameCanvas({ onScoreChange, onGameOver, onStateChange }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const orchestratorRef = useRef<GameOrchestrator | null>(null);

    // Use refs for callbacks to avoid re-initializing orchestrator
    const callbacksRef = useRef({ onScoreChange, onGameOver, onStateChange });
    useEffect(() => {
      callbacksRef.current = { onScoreChange, onGameOver, onStateChange };
    });

    useImperativeHandle(ref, () => ({
      resume: () => orchestratorRef.current?.resume(),
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const orchestrator = new GameOrchestrator();
      orchestratorRef.current = orchestrator;

      orchestrator.init(canvas, {
        onScoreChange: (score) => callbacksRef.current.onScoreChange?.(score),
        onGameOver: (score) => callbacksRef.current.onGameOver?.(score),
        onStateChange: (state) => callbacksRef.current.onStateChange?.(state),
      });

      orchestrator.start();

      return () => {
        orchestrator.cleanup();
        orchestratorRef.current = null;
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        style={{
          width: "100%",
          height: "100%",
          aspectRatio: "480 / 640",
          objectFit: "contain",
          display: "block",
        }}
      />
    );
  },
);
