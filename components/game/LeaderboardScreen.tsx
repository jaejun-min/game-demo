"use client";

import { useEffect, useState } from "react";

interface ScoreEntry {
  name: string;
  score: number;
}

interface LeaderboardScreenProps {
  onBack: () => void;
}

const RANK_MEDALS = ["\u{1F947}", "\u{1F948}", "\u{1F949}"];

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setScores(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div
      className="relative flex flex-col items-center pt-8 gap-4 overflow-hidden"
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #0B1628 0%, #152A4A 35%, #1E3F6E 65%, #2A5F8F 100%)",
        borderRadius: 12,
      }}
    >
      {/* Stars */}
      <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
        {Array.from({ length: 25 }, (_, i) => (
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

      {/* Golden glow at top */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "30%",
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,213,79,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Trophy Icon */}
      <div className="game-float z-10" style={{ fontSize: "2.5rem", lineHeight: 1 }}>
        {"\u{1F3C6}"}
      </div>

      {/* Title */}
      <div className="text-center game-slide-up z-10">
        <h2
          className="game-title"
          style={{
            fontSize: "clamp(1.3rem, 5vw, 1.8rem)",
            color: "#FFD54F",
            textShadow: "0 0 20px rgba(255,213,79,0.25), 0 2px 0 rgba(0,0,0,0.4)",
          }}
        >
          LEADERBOARD
        </h2>
        <p
          style={{
            fontSize: "0.7rem",
            color: "rgba(150,200,255,0.5)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          Top 10 Pilots
        </p>
      </div>

      {/* Scores List */}
      <div
        className="rounded-2xl overflow-hidden game-slide-up flex-1 z-10"
        style={{
          width: "min(340px, 85%)",
          animationDelay: "0.15s",
          maxHeight: "calc(100% - 220px)",
          overflowY: "auto",
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(150,200,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        }}
      >
        {loading ? (
          <div
            className="p-8 text-center"
            style={{ color: "rgba(150,200,255,0.4)", fontSize: "0.85rem" }}
          >
            Loading...
          </div>
        ) : scores.length === 0 ? (
          <div
            className="p-8 text-center"
            style={{ color: "rgba(150,200,255,0.4)", fontSize: "0.85rem" }}
          >
            No scores yet
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header */}
            <div
              className="flex items-center px-4 py-2.5"
              style={{
                borderBottom: "1px solid rgba(150,200,255,0.08)",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(150,200,255,0.35)",
              }}
            >
              <span style={{ width: 44 }}>{"\u9806\u4F4D"}</span>
              <span className="flex-1">{"\u540D\u524D"}</span>
              <span className="text-right" style={{ width: 60 }}>{"\u70B9\u6570"}</span>
            </div>

            {/* Rows */}
            {scores.map((entry, index) => {
              const isTop3 = index < 3;
              return (
                <div
                  key={`${entry.name}-${entry.score}-${index}`}
                  className="flex items-center px-4 py-3 transition-colors"
                  style={{
                    borderBottom: index < scores.length - 1
                      ? "1px solid rgba(150,200,255,0.05)"
                      : "none",
                    background: isTop3
                      ? `rgba(255,213,79,${0.06 - index * 0.015})`
                      : "transparent",
                  }}
                >
                  <span
                    style={{
                      width: 44,
                      fontSize: isTop3 ? "1.2rem" : "0.85rem",
                      fontWeight: isTop3 ? 800 : 600,
                      color: isTop3 ? "#FFD54F" : "rgba(150,200,255,0.45)",
                    }}
                  >
                    {isTop3 ? RANK_MEDALS[index] : index + 1}
                  </span>
                  <span
                    className="flex-1 truncate"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: isTop3 ? 700 : 500,
                      color: isTop3 ? "#FFFFFF" : "rgba(200,220,255,0.75)",
                    }}
                  >
                    {entry.name}
                  </span>
                  <span
                    className="text-right"
                    style={{
                      width: 60,
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      fontVariantNumeric: "tabular-nums",
                      color: isTop3 ? "#FFD54F" : "rgba(200,220,255,0.8)",
                    }}
                  >
                    {entry.score}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="game-slide-up pb-6 z-10" style={{ animationDelay: "0.3s" }}>
        <button
          onClick={onBack}
          className="cursor-pointer transition-all active:scale-95"
          style={{
            padding: "10px 40px",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "rgba(180,210,255,0.8)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(150,200,255,0.2)",
            borderRadius: 50,
          }}
        >
          BACK
        </button>
      </div>
    </div>
  );
}
