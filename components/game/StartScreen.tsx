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

      {/* Animated plane SVG */}
      <div className="game-float" style={{ marginTop: "-8%" }}>
        <svg width="96" height="72" viewBox="0 0 96 72">
          {/* Engine glow */}
          <ellipse cx="12" cy="36" rx="10" ry="6" fill="url(#exhaustGlow)" opacity="0.7">
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
          <defs>
            <radialGradient id="exhaustGlow">
              <stop offset="0%" stopColor="#FFB74D" />
              <stop offset="60%" stopColor="#FF8A65" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FF5722" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5F5F5" />
              <stop offset="40%" stopColor="#E0E0E0" />
              <stop offset="100%" stopColor="#BDBDBD" />
            </linearGradient>
            <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E0E0E0" />
              <stop offset="100%" stopColor="#9E9E9E" />
            </linearGradient>
          </defs>
          {/* Engine */}
          <rect x="10" y="31" width="8" height="10" rx="1" fill="#616161" />
          {/* Tail fin */}
          <polygon points="20,36 10,14 28,34" fill="#EF5350" stroke="#C62828" strokeWidth="0.8" />
          <polygon points="20,36 10,58 28,38" fill="#BDBDBD" stroke="#9E9E9E" strokeWidth="0.5" />
          {/* Body */}
          <ellipse cx="48" cy="36" rx="32" ry="10" fill="url(#bodyGrad)" stroke="#9E9E9E" strokeWidth="0.8" />
          {/* Stripe */}
          <line x1="18" y1="38" x2="75" y2="38" stroke="#EF5350" strokeWidth="1.5" opacity="0.7" />
          {/* Windows */}
          <circle cx="40" cy="33" r="1.5" fill="#90CAF9" opacity="0.6" />
          <circle cx="46" cy="33" r="1.5" fill="#90CAF9" opacity="0.6" />
          <circle cx="52" cy="33" r="1.5" fill="#90CAF9" opacity="0.6" />
          {/* Top wing */}
          <polygon points="38,26 50,8 58,10 48,26" fill="url(#wingGrad)" stroke="#9E9E9E" strokeWidth="0.5" />
          <polygon points="50,8 58,10 56,14 49,12" fill="#EF5350" opacity="0.8" />
          {/* Bottom wing */}
          <polygon points="38,46 50,64 58,62 48,46" fill="url(#wingGrad)" stroke="#9E9E9E" strokeWidth="0.5" />
          <polygon points="50,64 58,62 56,58 49,60" fill="#EF5350" opacity="0.8" />
          {/* Cockpit */}
          <ellipse cx="68" cy="34" rx="8" ry="8" fill="#42A5F5" stroke="#1565C0" strokeWidth="0.8" />
          <ellipse cx="70" cy="32" rx="3" ry="3" fill="white" opacity="0.35" />
          {/* Nose */}
          <polygon points="76,36 84,33 84,39" fill="#757575" />
          {/* Propeller disc */}
          <ellipse cx="84" cy="36" rx="2" ry="12" fill="#9E9E9E" opacity="0.4">
            <animate attributeName="ry" values="12;10;12" dur="0.1s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="84" cy="36" r="2.5" fill="#757575" />
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
