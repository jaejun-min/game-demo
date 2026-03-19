"use client";

interface StartScreenProps {
  onPlay: () => void;
  onLeaderboard: () => void;
}

export function StartScreen({ onPlay, onLeaderboard }: StartScreenProps) {
  return (
    <div
      className="relative flex flex-col items-center justify-center gap-8 overflow-hidden"
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, #0B1628 0%, #152A4A 35%, #1E3F6E 65%, #2A5F8F 100%)",
        borderRadius: 12,
      }}
    >
      {/* Stars */}
      <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
        {Array.from({ length: 40 }, (_, i) => (
          <circle
            key={i}
            cx={`${(i * 37 + 13) % 100}%`}
            cy={`${(i * 23 + 7) % 85}%`}
            r={i % 5 === 0 ? 1.5 : 0.8}
            fill="white"
            opacity={0.2 + (i % 4) * 0.15}
          >
            <animate
              attributeName="opacity"
              values={`${0.2 + (i % 4) * 0.15};${0.5 + (i % 3) * 0.15};${0.2 + (i % 4) * 0.15}`}
              dur={`${2 + (i % 3)}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* Horizon glow */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "35%",
          background: "radial-gradient(ellipse 120% 80% at 50% 100%, rgba(42,95,143,0.5) 0%, transparent 70%)",
        }}
      />

      {/* Animated stealth jet SVG */}
      <div className="game-float" style={{ marginTop: "-8%" }}>
        <svg width="96" height="72" viewBox="0 0 96 72">
          <defs>
            <radialGradient id="jetGlow" cx="15%" cy="50%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="50%" stopColor="#00B8D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#006064" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0F4F8" />
              <stop offset="50%" stopColor="#D8DEE6" />
              <stop offset="100%" stopColor="#B0BAC8" />
            </linearGradient>
            <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D0D8E0" />
              <stop offset="100%" stopColor="#A0B0C0" />
            </linearGradient>
          </defs>
          {/* Afterburner glow */}
          <ellipse cx="10" cy="36" rx="12" ry="6" fill="url(#jetGlow)" opacity="0.6">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="rx" values="10;14;10" dur="0.5s" repeatCount="indefinite" />
          </ellipse>
          {/* Nozzle */}
          <rect x="16" y="31" width="6" height="10" fill="#8090A0" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
          {/* Twin tail fins */}
          <polygon points="22,36 12,14 18,16 26,34" fill="#C0C8D8" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <polygon points="22,36 12,58 18,56 26,38" fill="#B0B8C8" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
          <line x1="14" y1="18" x2="25" y2="34" stroke="#00E5FF" strokeWidth="0.8" opacity="0.7" />
          <line x1="14" y1="54" x2="25" y2="38" stroke="#00E5FF" strokeWidth="0.8" opacity="0.5" />
          {/* Top delta wing */}
          <polygon points="30,28 40,8 56,12 52,28" fill="url(#wingGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <line x1="40" y1="8" x2="56" y2="12" stroke="#00E5FF" strokeWidth="1" opacity="0.7" />
          {/* Bottom delta wing */}
          <polygon points="30,44 40,64 56,60 52,44" fill="url(#wingGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <line x1="40" y1="64" x2="56" y2="60" stroke="#00E5FF" strokeWidth="1" opacity="0.5" />
          {/* Angular fuselage */}
          <polygon points="18,36 28,26 56,27 78,34 80,36 78,38 56,45 28,46" fill="url(#bodyGrad)" stroke="rgba(160,180,200,0.5)" strokeWidth="0.6" />
          {/* Center ridge */}
          <line x1="22" y1="36" x2="76" y2="36" stroke="rgba(160,180,200,0.25)" strokeWidth="0.5" />
          {/* Neon accent stripe */}
          <line x1="22" y1="37" x2="72" y2="37" stroke="#00E5FF" strokeWidth="1.2" opacity="0.8" />
          {/* Canopy */}
          <path d="M48,27 Q58,22 70,33 L70,37 Q58,40 48,38 Z" fill="rgba(100,220,255,0.6)" stroke="rgba(0,229,255,0.4)" strokeWidth="0.8" />
          <ellipse cx="62" cy="30" rx="3" ry="3" fill="white" opacity="0.4" />
          {/* Nose tip */}
          <polygon points="76,34 84,36 76,38" fill="#C0C8D4" />
          <circle cx="82" cy="36" r="1.2" fill="#00E5FF" opacity="0.7">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      {/* Title */}
      <div className="text-center game-slide-up" style={{ animationDelay: "0.1s" }}>
        <h1
          className="game-title"
          style={{
            fontSize: "clamp(2rem, 8vw, 3.2rem)",
            color: "#FFFFFF",
            textShadow: "0 0 30px rgba(100,180,255,0.3), 0 2px 0 rgba(0,0,0,0.4)",
          }}
        >
          SKY DODGE
        </h1>
        <p
          className="game-subtitle mt-2"
          style={{
            fontSize: "clamp(0.65rem, 2.5vw, 0.8rem)",
            color: "rgba(150,200,255,0.7)",
            textShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          Flappy Plane Adventure
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 items-center z-10 game-slide-up" style={{ animationDelay: "0.3s" }}>
        <button
          onClick={onPlay}
          className="cursor-pointer transition-all active:scale-95"
          style={{
            padding: "14px 56px",
            fontSize: "1.15rem",
            fontWeight: 800,
            letterSpacing: "0.05em",
            color: "#1B2838",
            background: "linear-gradient(180deg, #FFD54F 0%, #FFB300 100%)",
            border: "3px solid #FF8F00",
            borderRadius: 50,
            boxShadow: "0 4px 0 #E65100, 0 0 24px rgba(255,183,0,0.25), 0 6px 16px rgba(0,0,0,0.3)",
          }}
        >
          PLAY
        </button>
        <button
          onClick={onLeaderboard}
          className="cursor-pointer transition-all active:scale-95"
          style={{
            padding: "10px 36px",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "rgba(180,210,255,0.9)",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(150,200,255,0.25)",
            borderRadius: 50,
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          }}
        >
          LEADERBOARD
        </button>
      </div>
    </div>
  );
}
