import { describe, it, expect } from "vitest";
import { ThemeSystem, lerpColor } from "@/lib/game/theme";
import { THEME_TRANSITION_DURATION } from "@/lib/game/constants";

describe("ThemeSystem", () => {
  const theme = new ThemeSystem();

  describe("getTheme", () => {
    it('should return "day" for score 0', () => {
      expect(theme.getTheme(0)).toBe("day");
    });

    it('should return "day" for score 9', () => {
      expect(theme.getTheme(9)).toBe("day");
    });

    it('should return "sunset" for score 10', () => {
      expect(theme.getTheme(10)).toBe("sunset");
    });

    it('should return "sunset" for score 24', () => {
      expect(theme.getTheme(24)).toBe("sunset");
    });

    it('should return "night" for score 25', () => {
      expect(theme.getTheme(25)).toBe("night");
    });

    it('should return "night" for score 49', () => {
      expect(theme.getTheme(49)).toBe("night");
    });

    it('should return "space" for score 50', () => {
      expect(theme.getTheme(50)).toBe("space");
    });

    it('should return "space" for score 100', () => {
      expect(theme.getTheme(100)).toBe("space");
    });
  });

  describe("getColors", () => {
    it("should return color palette for day theme", () => {
      const colors = theme.getColors(0);
      expect(colors).toHaveProperty("background");
      expect(colors).toHaveProperty("pipe");
      expect(colors).toHaveProperty("plane");
      expect(colors).toHaveProperty("scoreText");
    });

    it("should return different colors for different themes", () => {
      const dayColors = theme.getColors(0);
      const spaceColors = theme.getColors(50);
      expect(dayColors.background).not.toBe(spaceColors.background);
    });
  });

  describe("lerpColor", () => {
    it("should return colorA when t = 0", () => {
      expect(lerpColor("#000000", "#FFFFFF", 0)).toBe("#000000");
    });

    it("should return colorB when t = 1", () => {
      expect(lerpColor("#000000", "#FFFFFF", 1)).toBe("#FFFFFF");
    });

    it("should return midpoint when t = 0.5", () => {
      const result = lerpColor("#000000", "#FFFFFF", 0.5);
      // midpoint of 0 and 255 is ~128
      expect(result).toBe("#808080");
    });

    it("should clamp t below 0", () => {
      expect(lerpColor("#000000", "#FFFFFF", -1)).toBe("#000000");
    });

    it("should clamp t above 1", () => {
      expect(lerpColor("#000000", "#FFFFFF", 2)).toBe("#FFFFFF");
    });
  });

  describe("getBackgroundColor", () => {
    it("should return day background at score 0 with full transition", () => {
      const bg = theme.getBackgroundColor(0, THEME_TRANSITION_DURATION);
      const dayColors = theme.getColors(0);
      expect(bg).toBe(dayColors.background);
    });

    it("should interpolate from day to sunset at score 10 with partial transition", () => {
      const bg = theme.getBackgroundColor(10, 0);
      const dayColors = theme.getColors(0);
      // At transition progress 0, should be the previous theme's color
      expect(bg).toBe(dayColors.background);
    });

    it("should return sunset background at score 10 with complete transition", () => {
      const bg = theme.getBackgroundColor(10, THEME_TRANSITION_DURATION);
      const sunsetColors = theme.getColors(10);
      expect(bg).toBe(sunsetColors.background);
    });

    it("should interpolate between previous and current theme colors at midpoint", () => {
      const bg = theme.getBackgroundColor(10, THEME_TRANSITION_DURATION / 2);
      const dayColors = theme.getColors(0);
      const sunsetColors = theme.getColors(10);
      // Should be neither day nor sunset, but somewhere in between
      expect(bg).not.toBe(dayColors.background);
      expect(bg).not.toBe(sunsetColors.background);
    });
  });
});
