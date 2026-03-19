"use client";

interface PauseOverlayProps {
  onResume: () => void;
}

export function PauseOverlay({ onResume }: PauseOverlayProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
      style={{
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        zIndex: 10,
      }}
      onClick={onResume}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 20,
          padding: "28px 48px",
          textAlign: "center",
        }}
      >
        <div
          className="game-title"
          style={{
            fontSize: "2rem",
            color: "#FFFFFF",
            textShadow: "0 0 20px rgba(255,255,255,0.3)",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        >
          PAUSED
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            marginTop: 10,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.05em",
          }}
        >
          Press Space or Tap to resume
        </div>
      </div>
    </div>
  );
}
