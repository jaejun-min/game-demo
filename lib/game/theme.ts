import {
  THEME_SUNSET_SCORE,
  THEME_NIGHT_SCORE,
  THEME_SPACE_SCORE,
  THEME_TRANSITION_DURATION,
} from "./constants";

export type ThemeName = "day" | "sunset" | "night" | "space";

export interface ThemeColors {
  background: string;
  backgroundGradient: [string, string];
  pipe: string;
  plane: string;
  scoreText: string;
}

const THEMES: Record<ThemeName, ThemeColors> = {
  day: {
    background: "#0F2040",
    backgroundGradient: ["#0B1628", "#1E3F6E"],
    pipe: "#228B22",
    plane: "#FF6347",
    scoreText: "#FFFFFF",
  },
  sunset: {
    background: "#1A2040",
    backgroundGradient: ["#0D1830", "#2A3050"],
    pipe: "#8B4513",
    plane: "#FFD700",
    scoreText: "#FFFFFF",
  },
  night: {
    background: "#080E20",
    backgroundGradient: ["#060C1A", "#101830"],
    pipe: "#4B0082",
    plane: "#00FFFF",
    scoreText: "#FFFFFF",
  },
  space: {
    background: "#030510",
    backgroundGradient: ["#020408", "#0A0E20"],
    pipe: "#8A2BE2",
    plane: "#FF00FF",
    scoreText: "#FFFFFF",
  },
};

/**
 * Parse a hex color string (#RRGGBB) into [r, g, b].
 */
function parseHex(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/**
 * Convert [r, g, b] to #RRGGBB.
 */
function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    clamp(r).toString(16).padStart(2, "0").toUpperCase() +
    clamp(g).toString(16).padStart(2, "0").toUpperCase() +
    clamp(b).toString(16).padStart(2, "0").toUpperCase()
  );
}

/**
 * Linearly interpolate between two hex colors by t (0..1).
 */
export function lerpColor(colorA: string, colorB: string, t: number): string {
  const [r1, g1, b1] = parseHex(colorA);
  const [r2, g2, b2] = parseHex(colorB);
  const clamped = Math.max(0, Math.min(1, t));
  return toHex(
    r1 + (r2 - r1) * clamped,
    g1 + (g2 - g1) * clamped,
    b1 + (b2 - b1) * clamped,
  );
}

export class ThemeSystem {
  /**
   * Determine the current theme based on score.
   */
  getTheme(score: number): ThemeName {
    if (score >= THEME_SPACE_SCORE) return "space";
    if (score >= THEME_NIGHT_SCORE) return "night";
    if (score >= THEME_SUNSET_SCORE) return "sunset";
    return "day";
  }

  /**
   * Get the color palette for the current theme.
   */
  getColors(score: number): ThemeColors {
    return THEMES[this.getTheme(score)];
  }

  /**
   * Get the background color interpolated between previous and current theme.
   * @param score Current score
   * @param transitionProgress Progress through the transition (0..THEME_TRANSITION_DURATION seconds)
   */
  getBackgroundColor(score: number, transitionProgress: number): string {
    const currentTheme = this.getTheme(score);
    const currentColors = THEMES[currentTheme];
    const previousTheme = this.getPreviousTheme(currentTheme);
    const previousColors = THEMES[previousTheme];

    const t = Math.max(0, Math.min(1, transitionProgress / THEME_TRANSITION_DURATION));
    return lerpColor(previousColors.background, currentColors.background, t);
  }

  private getPreviousTheme(current: ThemeName): ThemeName {
    switch (current) {
      case "space":
        return "night";
      case "night":
        return "sunset";
      case "sunset":
        return "day";
      case "day":
        return "day";
    }
  }
}
