"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { StartScreen } from "@/components/game/StartScreen";
import { GameCanvas } from "@/components/game/GameCanvas";
import type { GameCanvasHandle } from "@/components/game/GameCanvas";
import { GameOverScreen } from "@/components/game/GameOverScreen";
import { PauseOverlay } from "@/components/game/PauseOverlay";
import { LeaderboardScreen } from "@/components/game/LeaderboardScreen";
import type { GameStateType } from "@/lib/game/state";

type ScreenState = "start" | "playing" | "paused" | "gameover" | "leaderboard";

export default function Page() {
  const [screen, setScreen] = useState<ScreenState>("start");
  const [finalScore, setFinalScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const gameCanvasRef = useRef<GameCanvasHandle>(null);

  const handlePlay = useCallback(() => {
    setGameKey((k) => k + 1);
    setScreen("playing");
  }, []);

  const handleGameOver = useCallback((score: number) => {
    setFinalScore(score);
    setSubmitError(null);
    setScreen("gameover");
  }, []);

  const handleStateChange = useCallback((state: GameStateType) => {
    if (state === "paused") {
      setScreen("paused");
    } else if (state === "playing") {
      setScreen("playing");
    }
  }, []);

  const handleResume = useCallback(() => {
    gameCanvasRef.current?.resume();
  }, []);

  // C1: Keyboard listener for resume during paused state
  useEffect(() => {
    if (screen !== "paused") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleResume();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [screen, handleResume]);

  const handleSubmit = useCallback(
    async (name: string) => {
      try {
        const res = await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, score: finalScore }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setSubmitError(data.error || "Failed to submit score");
          return;
        }

        setScreen("leaderboard");
      } catch {
        setSubmitError("Network error. Please try again.");
      }
    },
    [finalScore],
  );

  const handleSkip = useCallback(() => {
    setScreen("start");
  }, []);

  const handleLeaderboard = useCallback(() => {
    setScreen("leaderboard");
  }, []);

  const handleBackFromLeaderboard = useCallback(() => {
    setScreen("start");
  }, []);

  return (
    <main
      className="min-h-dvh flex items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at 50% 30%, #0B1628 0%, #060D18 70%, #030810 100%)",
      }}
    >
      <div
        className="relative"
        style={{
          width: "100%",
          maxHeight: "90dvh",
          aspectRatio: "480 / 640",
          maxWidth: "calc(90dvh * 480 / 640)",
        }}
      >
        {screen === "start" && (
          <StartScreen onPlay={handlePlay} onLeaderboard={handleLeaderboard} />
        )}

        {(screen === "playing" || screen === "paused") && (
          <div className="relative" style={{ width: "100%", height: "100%" }}>
            <GameCanvas
              key={gameKey}
              ref={gameCanvasRef}
              onGameOver={handleGameOver}
              onStateChange={handleStateChange}
            />
            {screen === "paused" && <PauseOverlay onResume={handleResume} />}
          </div>
        )}

        {screen === "gameover" && (
          <GameOverScreen
            score={finalScore}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            error={submitError}
          />
        )}

        {screen === "leaderboard" && (
          <LeaderboardScreen onBack={handleBackFromLeaderboard} />
        )}
      </div>
    </main>
  );
}
