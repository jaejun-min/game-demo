"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface GameOverScreenProps {
  score: number;
  onSubmit: (name: string) => Promise<void>;
  onSkip: () => void;
  error?: string | null;
}

export function GameOverScreen({
  score,
  onSubmit,
  onSkip,
  error,
}: GameOverScreenProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center gap-5 overflow-hidden"
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #0B1628 0%, #152A4A 35%, #1E3F6E 65%, #2A5F8F 100%)",
        borderRadius: 12,
      }}
    >
      {/* Stars (same pattern as start) */}
      <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
        {Array.from({ length: 30 }, (_, i) => (
          <circle
            key={i}
            cx={`${(i * 37 + 13) % 100}%`}
            cy={`${(i * 23 + 7) % 85}%`}
            r={i % 5 === 0 ? 1.5 : 0.8}
            fill="white"
            opacity={0.15 + (i % 4) * 0.1}
          >
            <animate
              attributeName="opacity"
              values={`${0.15 + (i % 4) * 0.1};${0.35 + (i % 3) * 0.1};${0.15 + (i % 4) * 0.1}`}
              dur={`${2 + (i % 3)}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* Red/amber dramatic glow at top */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "40%",
          background: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(255,80,80,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Game Over Title */}
      <div className="text-center game-slide-up z-10">
        <h2
          className="game-title"
          style={{
            fontSize: "clamp(1.8rem, 7vw, 2.8rem)",
            color: "#FF6B6B",
            textShadow: "0 0 30px rgba(255,107,107,0.35), 0 2px 0 rgba(0,0,0,0.4)",
          }}
        >
          GAME OVER
        </h2>
      </div>

      {/* Score Card */}
      <div
        className="rounded-2xl p-6 text-center game-score-display z-10"
        style={{
          width: "min(280px, 75%)",
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(150,200,255,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(150,200,255,0.5)",
          }}
        >
          Final Score
        </div>
        <div
          style={{
            fontSize: "clamp(3rem, 12vw, 4.5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginTop: 4,
            color: "#FFFFFF",
            textShadow: "0 0 30px rgba(255,255,255,0.15)",
          }}
        >
          {score}
        </div>
      </div>

      {/* Name Input Section */}
      <div
        className="flex flex-col gap-3 items-center game-slide-up z-10"
        style={{ width: "min(280px, 75%)", animationDelay: "0.3s" }}
      >
        <label
          style={{
            fontSize: "0.75rem",
            color: "rgba(150,200,255,0.55)",
            letterSpacing: "0.05em",
          }}
        >
          Enter your name for leaderboard
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          placeholder="Your name"
          className="text-center"
          maxLength={20}
          aria-label="Player name"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(150,200,255,0.2)",
            color: "#FFFFFF",
            borderRadius: 12,
            height: 44,
            fontSize: "1rem",
          }}
        />
        {error && (
          <div className="text-xs" role="alert" style={{ color: "#FF6B6B" }}>
            {error}
          </div>
        )}
        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={onSkip}
            className="flex-1 cursor-pointer transition-all active:scale-95"
            style={{
              padding: "12px 0",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "rgba(180,210,255,0.7)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(150,200,255,0.15)",
              borderRadius: 50,
            }}
          >
            Skip
          </button>
          <button
            disabled={!name.trim() || isSubmitting}
            onClick={handleSubmit}
            className="flex-1 cursor-pointer transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              padding: "12px 0",
              fontSize: "0.9rem",
              fontWeight: 800,
              color: !name.trim() || isSubmitting ? "rgba(180,210,255,0.4)" : "#1B2838",
              background: !name.trim() || isSubmitting
                ? "rgba(255,255,255,0.08)"
                : "linear-gradient(180deg, #FFD54F 0%, #FFB300 100%)",
              border: !name.trim() || isSubmitting
                ? "1px solid rgba(150,200,255,0.1)"
                : "2px solid #FF8F00",
              borderRadius: 50,
              boxShadow: !name.trim() || isSubmitting
                ? "none"
                : "0 3px 0 #E65100, 0 0 16px rgba(255,183,0,0.2)",
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
