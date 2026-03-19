import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { ThemeSystem, ThemeColors, type ThemeName } from "./theme";
import { Plane } from "./plane";
import { Pipe } from "./pipe";

interface CloudData {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  opacity: number;
  speed: number;
}

interface StarData {
  x: number;
  y: number;
  size: number;
  brightness: number;
}

interface PlanetData {
  x: number;
  y: number;
  radius: number;
  color: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private themeSystem: ThemeSystem;

  // Cached decorations (generated once)
  private clouds: CloudData[] = [];
  private baseStars: StarData[] = [];
  private nightStars: StarData[] = [];
  private spaceStars: StarData[] = [];
  private planets: PlanetData[] = [];
  private decorationsInitialized = false;
  private frameCount = 0;

  // Trail history for plane
  private trailHistory: { x: number; y: number }[] = [];

  // Flap burst effect
  private flapBurstFrame = 0;
  private lastVelocityY = 0;

  constructor(ctx: CanvasRenderingContext2D, themeSystem?: ThemeSystem) {
    this.ctx = ctx;
    this.themeSystem = themeSystem ?? new ThemeSystem();
  }

  private initDecorations(): void {
    if (this.decorationsInitialized) return;
    this.decorationsInitialized = true;

    // Generate clouds (subtle, semi-transparent for navy sky)
    const cloudConfigs = [
      { x: 80, y: 80, radiusX: 60, radiusY: 25 },
      { x: 250, y: 140, radiusX: 50, radiusY: 20 },
      { x: 400, y: 60, radiusX: 70, radiusY: 22 },
      { x: 150, y: 200, radiusX: 45, radiusY: 18 },
    ];
    this.clouds = cloudConfigs.map((c, i) => ({
      ...c,
      opacity: 0.08 + Math.random() * 0.07,
      speed: 8 + i * 3,
    }));

    // Generate base stars (always visible in all themes)
    const baseStarCount = 40 + Math.floor(Math.random() * 20);
    this.baseStars = [];
    for (let i = 0; i < baseStarCount; i++) {
      this.baseStars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT * 0.85),
        size: 0.4 + Math.random() * 1.5,
        brightness: 0.2 + Math.random() * 0.5,
      });
    }

    // Generate night stars (30-50)
    const nightStarCount = 30 + Math.floor(Math.random() * 21);
    this.nightStars = [];
    for (let i = 0; i < nightStarCount; i++) {
      this.nightStars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT * 0.8),
        size: 0.5 + Math.random() * 2,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }

    // Generate space stars (60-80)
    const spaceStarCount = 60 + Math.floor(Math.random() * 21);
    this.spaceStars = [];
    for (let i = 0; i < spaceStarCount; i++) {
      this.spaceStars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: 0.5 + Math.random() * 2.5,
        brightness: 0.2 + Math.random() * 0.8,
      });
    }

    // Generate planets for space theme
    this.planets = [
      { x: 380, y: 120, radius: 18, color: "#E74C3C", shadowOffsetX: 5, shadowOffsetY: 3 },
      { x: 100, y: 80, radius: 12, color: "#3498DB", shadowOffsetX: 3, shadowOffsetY: 2 },
      { x: 300, y: 500, radius: 15, color: "#F39C12", shadowOffsetX: 4, shadowOffsetY: 3 },
    ];
  }

  render(plane: Plane, pipes: Pipe[], score: number, showGuide: boolean = false): void {
    this.initDecorations();
    this.frameCount++;

    const theme = this.themeSystem.getTheme(score);
    const colors = this.themeSystem.getColors(score);

    this.drawBackground(theme, colors);
    this.drawPipes(pipes, theme);
    this.drawTrail(plane, theme);
    this.drawPlane(plane, theme);
    this.drawScore(score);

    if (showGuide) {
      this.drawStartGuide();
    }
  }

  renderPauseOverlay(): void {
    this.ctx.fillStyle = "rgba(0,0,0,0.3)";
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.font = "bold 36px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Paused", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    this.ctx.font = "14px sans-serif";
    this.ctx.fillText(
      "Press Space or Tap to resume",
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 30,
    );
  }

  // === START GUIDE ===

  private drawStartGuide(): void {
    const ctx = this.ctx;
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2 + 60;

    // Pulsing effect
    const pulse = 0.7 + Math.sin(this.frameCount * 0.05) * 0.3;

    // Semi-transparent card
    ctx.save();
    ctx.globalAlpha = pulse;

    // Card background
    const cardW = 280;
    const cardH = 90;
    const cardX = cx - cardW / 2;
    const cardY = cy - cardH / 2;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    this.roundRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    this.roundRect(ctx, cardX, cardY, cardW, cardH / 2, 16);
    ctx.fill();

    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    this.roundRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.stroke();

    ctx.globalAlpha = 1;

    // Title text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TAP TO FLY!", cx, cy - 14);

    // Control hints
    ctx.font = "13px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Space  /  Click  /  Tap", cx, cy + 14);

    // Bouncing arrow
    const arrowBounce = Math.sin(this.frameCount * 0.08) * 6;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "20px sans-serif";
    ctx.fillText("\u25B2", cx, cy - 38 + arrowBounce);

    ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // === BACKGROUND ===

  private drawBackground(theme: ThemeName, colors: ThemeColors): void {
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, colors.backgroundGradient[0]);
    grad.addColorStop(1, colors.backgroundGradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Base stars visible in all themes
    this.drawBaseStars(theme);

    switch (theme) {
      case "day":
        this.drawDayDecorations();
        break;
      case "sunset":
        this.drawSunsetDecorations();
        break;
      case "night":
        this.drawNightDecorations();
        break;
      case "space":
        this.drawSpaceDecorations();
        break;
    }
  }

  private drawBaseStars(theme: ThemeName): void {
    const ctx = this.ctx;
    const brightnessMult = theme === "day" ? 0.6 : theme === "sunset" ? 0.8 : 1.0;

    for (const star of this.baseStars) {
      ctx.save();
      const twinkle = star.brightness * brightnessMult *
        (0.7 + 0.3 * Math.sin(this.frameCount * 0.025 + star.x * 0.5));
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawDayDecorations(): void {
    const ctx = this.ctx;

    // Subtle cloud wisps (transparent in navy sky)
    for (const cloud of this.clouds) {
      const drift = (this.frameCount * cloud.speed * 0.02) % (CANVAS_WIDTH + cloud.radiusX * 4);
      const cx = ((cloud.x + drift) % (CANVAS_WIDTH + cloud.radiusX * 4)) - cloud.radiusX * 2;

      ctx.save();
      ctx.globalAlpha = cloud.opacity;
      ctx.fillStyle = "rgba(100,160,255,0.5)";

      ctx.beginPath();
      ctx.ellipse(cx, cloud.y, cloud.radiusX, cloud.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx - cloud.radiusX * 0.4, cloud.y - cloud.radiusY * 0.5, cloud.radiusX * 0.5, cloud.radiusY * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // City silhouette at bottom
    ctx.fillStyle = "#0A1525";
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT - 35);
    // Building shapes
    ctx.lineTo(20, CANVAS_HEIGHT - 35);
    ctx.lineTo(20, CANVAS_HEIGHT - 55);
    ctx.lineTo(45, CANVAS_HEIGHT - 55);
    ctx.lineTo(45, CANVAS_HEIGHT - 40);
    ctx.lineTo(70, CANVAS_HEIGHT - 40);
    ctx.lineTo(70, CANVAS_HEIGHT - 70);
    ctx.lineTo(90, CANVAS_HEIGHT - 70);
    ctx.lineTo(90, CANVAS_HEIGHT - 45);
    ctx.lineTo(120, CANVAS_HEIGHT - 45);
    ctx.lineTo(120, CANVAS_HEIGHT - 85);
    ctx.lineTo(140, CANVAS_HEIGHT - 85);
    ctx.lineTo(140, CANVAS_HEIGHT - 50);
    ctx.lineTo(170, CANVAS_HEIGHT - 50);
    ctx.lineTo(170, CANVAS_HEIGHT - 65);
    ctx.lineTo(200, CANVAS_HEIGHT - 65);
    ctx.lineTo(200, CANVAS_HEIGHT - 38);
    ctx.lineTo(230, CANVAS_HEIGHT - 38);
    ctx.lineTo(230, CANVAS_HEIGHT - 95);
    ctx.lineTo(250, CANVAS_HEIGHT - 95);
    ctx.lineTo(250, CANVAS_HEIGHT - 42);
    ctx.lineTo(280, CANVAS_HEIGHT - 42);
    ctx.lineTo(280, CANVAS_HEIGHT - 60);
    ctx.lineTo(310, CANVAS_HEIGHT - 60);
    ctx.lineTo(310, CANVAS_HEIGHT - 35);
    ctx.lineTo(340, CANVAS_HEIGHT - 35);
    ctx.lineTo(340, CANVAS_HEIGHT - 75);
    ctx.lineTo(360, CANVAS_HEIGHT - 75);
    ctx.lineTo(360, CANVAS_HEIGHT - 45);
    ctx.lineTo(390, CANVAS_HEIGHT - 45);
    ctx.lineTo(390, CANVAS_HEIGHT - 55);
    ctx.lineTo(420, CANVAS_HEIGHT - 55);
    ctx.lineTo(420, CANVAS_HEIGHT - 30);
    ctx.lineTo(450, CANVAS_HEIGHT - 30);
    ctx.lineTo(450, CANVAS_HEIGHT - 48);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 48);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Tiny city window lights
    const windowPositions = [
      [25, CANVAS_HEIGHT - 50], [30, CANVAS_HEIGHT - 46],
      [75, CANVAS_HEIGHT - 62], [82, CANVAS_HEIGHT - 58],
      [125, CANVAS_HEIGHT - 78], [132, CANVAS_HEIGHT - 72], [128, CANVAS_HEIGHT - 65],
      [175, CANVAS_HEIGHT - 60], [182, CANVAS_HEIGHT - 56],
      [235, CANVAS_HEIGHT - 88], [240, CANVAS_HEIGHT - 80], [238, CANVAS_HEIGHT - 72],
      [285, CANVAS_HEIGHT - 55], [290, CANVAS_HEIGHT - 50],
      [345, CANVAS_HEIGHT - 68], [350, CANVAS_HEIGHT - 60],
      [395, CANVAS_HEIGHT - 50], [455, CANVAS_HEIGHT - 44],
    ];
    for (const [wx, wy] of windowPositions) {
      ctx.fillStyle = `rgba(255,220,100,${0.3 + Math.sin(this.frameCount * 0.01 + wx) * 0.2})`;
      ctx.fillRect(wx, wy, 2, 2);
    }

    // Horizon glow
    ctx.save();
    const horizonGlow = ctx.createLinearGradient(0, CANVAS_HEIGHT - 50, 0, CANVAS_HEIGHT);
    horizonGlow.addColorStop(0, "rgba(30,63,110,0)");
    horizonGlow.addColorStop(1, "rgba(20,40,80,0.5)");
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50);
    ctx.restore();
  }

  private drawSunsetDecorations(): void {
    const ctx = this.ctx;

    // Amber horizon glow
    const sunY = CANVAS_HEIGHT * 0.75;
    const glowGrad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, sunY, 20,
      CANVAS_WIDTH / 2, sunY, 180,
    );
    glowGrad.addColorStop(0, "rgba(255,160,50,0.15)");
    glowGrad.addColorStop(0.5, "rgba(255,100,30,0.06)");
    glowGrad.addColorStop(1, "rgba(255,50,0,0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, sunY, 180, 0, Math.PI * 2);
    ctx.fill();

    // Silhouette mountains
    ctx.fillStyle = "#080D18";
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT - 80);
    ctx.lineTo(80, CANVAS_HEIGHT - 130);
    ctx.lineTo(160, CANVAS_HEIGHT - 90);
    ctx.lineTo(240, CANVAS_HEIGHT - 150);
    ctx.lineTo(320, CANVAS_HEIGHT - 100);
    ctx.lineTo(400, CANVAS_HEIGHT - 120);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 70);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#060A14";
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT - 50);
    ctx.quadraticCurveTo(120, CANVAS_HEIGHT - 80, 240, CANVAS_HEIGHT - 55);
    ctx.quadraticCurveTo(360, CANVAS_HEIGHT - 75, CANVAS_WIDTH, CANVAS_HEIGHT - 40);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();
  }

  private drawNightDecorations(): void {
    const ctx = this.ctx;

    // Extra bright stars for night
    for (const star of this.nightStars) {
      ctx.save();
      const twinkle = star.brightness * (0.7 + 0.3 * Math.sin(this.frameCount * 0.03 + star.x));
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw crescent moon with glow
    const moonX = 380;
    const moonY = 100;
    const moonRadius = 30;

    ctx.save();
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 2.5);
    moonGlow.addColorStop(0, "rgba(200, 220, 255, 0.12)");
    moonGlow.addColorStop(1, "rgba(200, 220, 255, 0)");
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#D0D8E8";
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // Overlapping dark circle to create crescent
    ctx.fillStyle = "#0A1020";
    ctx.beginPath();
    ctx.arc(moonX + 12, moonY - 8, moonRadius - 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawSpaceDecorations(): void {
    const ctx = this.ctx;

    // Nebula effect (semi-transparent colored ellipses)
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#9B59B6";
    ctx.beginPath();
    ctx.ellipse(150, 300, 120, 80, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2980B9";
    ctx.beginPath();
    ctx.ellipse(350, 200, 100, 60, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw stars with twinkling
    for (const star of this.spaceStars) {
      ctx.save();
      const twinkle = star.brightness * (0.6 + 0.4 * Math.sin(this.frameCount * 0.02 + star.y));
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      // Cross sparkle for larger stars
      if (star.size > 1.5) {
        ctx.globalAlpha = twinkle * 0.4;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(star.x - star.size * 2, star.y);
        ctx.lineTo(star.x + star.size * 2, star.y);
        ctx.moveTo(star.x, star.y - star.size * 2);
        ctx.lineTo(star.x, star.y + star.size * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw planets
    for (const planet of this.planets) {
      // Planet body
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
      ctx.fill();

      // Shadow for 3D effect
      ctx.save();
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.arc(
        planet.x + planet.shadowOffsetX,
        planet.y + planet.shadowOffsetY,
        planet.radius,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();

      // Planet rim highlight
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.radius - 1, -0.8, 0.8);
      ctx.stroke();
      ctx.restore();
    }
  }

  // === PIPES (Neon Energy Barriers) ===

  private drawPipes(pipes: Pipe[], theme: ThemeName): void {
    const ctx = this.ctx;
    const neonColors = this.getNeonColors(theme);

    for (const pipe of pipes) {
      const top = pipe.getTopRect();
      const bottom = pipe.getBottomRect();

      this.drawNeonBarrier(ctx, top, neonColors, false);
      this.drawNeonBarrier(ctx, bottom, neonColors, true);

      // Gap edge glow (the opening between top and bottom)
      this.drawGapGlow(ctx, top, bottom, neonColors);
    }
  }

  private drawNeonBarrier(
    ctx: CanvasRenderingContext2D,
    rect: { x: number; y: number; width: number; height: number },
    colors: { core: string; glow: string; edge: string; bgAlpha: number },
    isBottom: boolean,
  ): void {
    const { x, y, width, height } = rect;

    // Dark metallic body
    const bodyGrad = ctx.createLinearGradient(x, 0, x + width, 0);
    bodyGrad.addColorStop(0, "rgba(15,20,35,0.95)");
    bodyGrad.addColorStop(0.15, "rgba(25,35,55,0.9)");
    bodyGrad.addColorStop(0.5, "rgba(20,30,50,0.95)");
    bodyGrad.addColorStop(0.85, "rgba(25,35,55,0.9)");
    bodyGrad.addColorStop(1, "rgba(15,20,35,0.95)");
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(x, y, width, height);

    // Metallic edge lines
    ctx.strokeStyle = "rgba(80,120,180,0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);

    // Inner panel lines (tech detail)
    const panelSpacing = 30;
    ctx.strokeStyle = "rgba(60,100,160,0.12)";
    ctx.lineWidth = 0.5;
    const startY = isBottom ? y : y + (height % panelSpacing);
    for (let py = startY; py < y + height; py += panelSpacing) {
      if (py > y && py < y + height) {
        ctx.beginPath();
        ctx.moveTo(x + 3, py);
        ctx.lineTo(x + width - 3, py);
        ctx.stroke();
      }
    }

    // Center neon strip
    const stripW = 4;
    const stripX = x + width / 2 - stripW / 2;
    const pulse = 0.6 + Math.sin(this.frameCount * 0.04) * 0.2;

    // Neon glow (wide)
    ctx.save();
    ctx.globalAlpha = pulse * 0.15;
    ctx.fillStyle = colors.glow;
    ctx.fillRect(x + width / 2 - 12, y, 24, height);
    ctx.restore();

    // Neon strip (core)
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = colors.core;
    ctx.fillRect(stripX, y, stripW, height);
    ctx.restore();

    // Bright center line
    ctx.save();
    ctx.globalAlpha = pulse * 0.8;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(stripX + 1, y, 2, height);
    ctx.restore();

    // Side accent lines
    ctx.save();
    ctx.globalAlpha = pulse * 0.3;
    ctx.fillStyle = colors.edge;
    ctx.fillRect(x + 2, y, 1.5, height);
    ctx.fillRect(x + width - 3.5, y, 1.5, height);
    ctx.restore();

    // Cap at the gap edge
    const capH = 8;
    const capY = isBottom ? y : y + height - capH;
    const capOverhang = 5;

    // Cap body
    const capGrad = ctx.createLinearGradient(x - capOverhang, 0, x + width + capOverhang, 0);
    capGrad.addColorStop(0, "rgba(20,30,50,0.95)");
    capGrad.addColorStop(0.3, "rgba(40,55,80,0.9)");
    capGrad.addColorStop(0.5, "rgba(50,70,100,0.9)");
    capGrad.addColorStop(0.7, "rgba(40,55,80,0.9)");
    capGrad.addColorStop(1, "rgba(20,30,50,0.95)");
    ctx.fillStyle = capGrad;
    ctx.fillRect(x - capOverhang, capY, width + capOverhang * 2, capH);

    // Cap neon edge
    ctx.save();
    ctx.globalAlpha = pulse * 0.6;
    ctx.fillStyle = colors.core;
    const edgeY = isBottom ? capY : capY + capH - 1.5;
    ctx.fillRect(x - capOverhang, edgeY, width + capOverhang * 2, 1.5);
    ctx.restore();

    // Cap border
    ctx.strokeStyle = "rgba(80,120,180,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - capOverhang, capY, width + capOverhang * 2, capH);
  }

  private drawGapGlow(
    ctx: CanvasRenderingContext2D,
    top: { x: number; y: number; width: number; height: number },
    bottom: { x: number; y: number; width: number; height: number },
    colors: { core: string; glow: string; edge: string; bgAlpha: number },
  ): void {
    const gapTop = top.y + top.height;
    const gapBottom = bottom.y;
    const gapCenter = (gapTop + gapBottom) / 2;
    const gapHeight = gapBottom - gapTop;

    // Faint glow in the gap area
    ctx.save();
    const gapGlow = ctx.createRadialGradient(
      top.x + top.width / 2, gapCenter, 0,
      top.x + top.width / 2, gapCenter, gapHeight * 0.8,
    );
    gapGlow.addColorStop(0, colors.glow.replace(")", ",0.06)").replace("rgb", "rgba"));
    gapGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gapGlow;
    ctx.fillRect(top.x - 20, gapTop - 10, top.width + 40, gapHeight + 20);
    ctx.restore();
  }

  private getNeonColors(theme: ThemeName) {
    switch (theme) {
      case "day":
        return { core: "#4FC3F7", glow: "#0288D1", edge: "#29B6F6", bgAlpha: 0.9 };
      case "sunset":
        return { core: "#FFB74D", glow: "#F57C00", edge: "#FFA726", bgAlpha: 0.9 };
      case "night":
        return { core: "#7C4DFF", glow: "#651FFF", edge: "#B388FF", bgAlpha: 0.9 };
      case "space":
        return { core: "#E040FB", glow: "#AA00FF", edge: "#EA80FC", bgAlpha: 0.9 };
    }
  }

  // === PLANE ===

  private drawTrail(plane: Plane, theme: ThemeName): void {
    const ctx = this.ctx;
    const cx = plane.x + plane.width / 2;
    const cy = plane.y + plane.height / 2;

    // Detect flap (velocity suddenly goes negative)
    if (plane.velocityY < -200 && this.lastVelocityY > -100) {
      this.flapBurstFrame = this.frameCount;
    }
    this.lastVelocityY = plane.velocityY;

    // Update trail
    this.trailHistory.push({ x: cx, y: cy });
    if (this.trailHistory.length > 16) {
      this.trailHistory.shift();
    }

    if (this.trailHistory.length < 3) return;

    // Draw dual trail (engine contrails)
    const trailColor = theme === "day" ? "rgba(100,180,255,"
      : theme === "sunset" ? "rgba(255,180,100,"
      : "rgba(120,200,255,";

    for (let i = 1; i < this.trailHistory.length; i++) {
      const t = i / this.trailHistory.length;
      const alpha = t * 0.35;
      const width = t * 4;

      ctx.strokeStyle = trailColor + alpha + ")";
      ctx.lineWidth = width;
      ctx.lineCap = "round";

      // Upper trail
      ctx.beginPath();
      ctx.moveTo(this.trailHistory[i - 1].x - 4, this.trailHistory[i - 1].y - 3);
      ctx.lineTo(this.trailHistory[i].x - 4, this.trailHistory[i].y - 3);
      ctx.stroke();

      // Lower trail
      ctx.beginPath();
      ctx.moveTo(this.trailHistory[i - 1].x - 4, this.trailHistory[i - 1].y + 3);
      ctx.lineTo(this.trailHistory[i].x - 4, this.trailHistory[i].y + 3);
      ctx.stroke();
    }

    // Flap burst effect
    const burstAge = this.frameCount - this.flapBurstFrame;
    if (burstAge < 12) {
      const burstProgress = burstAge / 12;
      const burstRadius = 8 + burstProgress * 20;
      const burstAlpha = (1 - burstProgress) * 0.4;

      ctx.save();
      ctx.globalAlpha = burstAlpha;
      const burstGrad = ctx.createRadialGradient(cx - 10, cy, 2, cx - 10, cy, burstRadius);
      burstGrad.addColorStop(0, "rgba(255,200,100,0.8)");
      burstGrad.addColorStop(0.5, "rgba(255,130,50,0.3)");
      burstGrad.addColorStop(1, "rgba(255,80,20,0)");
      ctx.fillStyle = burstGrad;
      ctx.beginPath();
      ctx.arc(cx - 10, cy, burstRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawPlane(plane: Plane, theme: ThemeName): void {
    const ctx = this.ctx;
    const cx = plane.x + plane.width / 2;
    const cy = plane.y + plane.height / 2;

    // Calculate tilt angle based on velocity
    const rotation = Math.max(-0.5, Math.min(0.5, plane.velocityY * 0.002));

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    const w = plane.width;
    const h = plane.height;
    const stripeColor = theme === "space" ? "#AB47BC" : theme === "night" ? "#42A5F5" : "#EF5350";

    // === ENGINE EXHAUST (dynamic based on velocity) ===
    const isRising = plane.velocityY < -50;
    const exhaustIntensity = isRising ? 1.0 : 0.4;
    const exhaustScale = isRising ? 1.3 : 0.7;
    const exhaustPulse = (0.4 + Math.sin(this.frameCount * 0.3) * 0.3) * exhaustIntensity;

    // Outer exhaust glow (large, faint)
    ctx.save();
    ctx.globalAlpha = exhaustPulse * 0.5;
    const outerExhaust = ctx.createRadialGradient(-w * 0.6, 0, 1, -w * 0.6, 0, w * 0.4 * exhaustScale);
    outerExhaust.addColorStop(0, "rgba(255,200,80,0.6)");
    outerExhaust.addColorStop(0.5, "rgba(255,120,30,0.2)");
    outerExhaust.addColorStop(1, "rgba(255,50,0,0)");
    ctx.fillStyle = outerExhaust;
    ctx.beginPath();
    ctx.ellipse(-w * 0.6, 0, w * 0.4 * exhaustScale, h * 0.2 * exhaustScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Inner exhaust flame
    ctx.save();
    ctx.globalAlpha = exhaustPulse;
    const innerExhaust = ctx.createRadialGradient(-w * 0.55, 0, 0, -w * 0.55, 0, w * 0.22 * exhaustScale);
    innerExhaust.addColorStop(0, "rgba(255,255,200,0.9)");
    innerExhaust.addColorStop(0.3, "rgba(255,180,60,0.7)");
    innerExhaust.addColorStop(0.7, "rgba(255,100,30,0.3)");
    innerExhaust.addColorStop(1, "rgba(255,50,0,0)");
    ctx.fillStyle = innerExhaust;
    ctx.beginPath();
    ctx.ellipse(-w * 0.55, 0, w * 0.22 * exhaustScale, h * 0.12 * exhaustScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Engine nozzle
    const nozzleGrad = ctx.createLinearGradient(-w * 0.5, -h * 0.15, -w * 0.5, h * 0.15);
    nozzleGrad.addColorStop(0, "#757575");
    nozzleGrad.addColorStop(0.3, "#9E9E9E");
    nozzleGrad.addColorStop(0.7, "#616161");
    nozzleGrad.addColorStop(1, "#424242");
    ctx.fillStyle = nozzleGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.42, -h * 0.12);
    ctx.lineTo(-w * 0.52, -h * 0.15);
    ctx.lineTo(-w * 0.52, h * 0.15);
    ctx.lineTo(-w * 0.42, h * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#424242";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // === TAIL FIN ===
    // Vertical stabilizer
    const tailGrad = ctx.createLinearGradient(-w * 0.55, -h * 0.6, -w * 0.2, 0);
    tailGrad.addColorStop(0, "#E53935");
    tailGrad.addColorStop(1, "#C62828");
    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, -h * 0.02);
    ctx.lineTo(-w * 0.48, -h * 0.6);
    ctx.lineTo(-w * 0.38, -h * 0.62);
    ctx.lineTo(-w * 0.20, -h * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#B71C1C";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Tail fin highlight
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#FF8A80";
    ctx.beginPath();
    ctx.moveTo(-w * 0.46, -h * 0.55);
    ctx.lineTo(-w * 0.40, -h * 0.58);
    ctx.lineTo(-w * 0.28, -h * 0.1);
    ctx.lineTo(-w * 0.34, -h * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Horizontal stabilizers (both sides)
    ctx.fillStyle = "#BDBDBD";
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, -h * 0.02);
    ctx.lineTo(-w * 0.50, h * 0.28);
    ctx.lineTo(-w * 0.42, h * 0.30);
    ctx.lineTo(-w * 0.22, h * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#9E9E9E";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // === FUSELAGE ===
    const fuselageGrad = ctx.createLinearGradient(0, -h * 0.32, 0, h * 0.32);
    fuselageGrad.addColorStop(0, "#FAFAFA");
    fuselageGrad.addColorStop(0.2, "#F0F0F0");
    fuselageGrad.addColorStop(0.5, "#E0E0E0");
    fuselageGrad.addColorStop(0.8, "#CACACA");
    fuselageGrad.addColorStop(1, "#A0A0A0");
    ctx.fillStyle = fuselageGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.52, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fuselage accent stripe
    ctx.strokeStyle = stripeColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-w * 0.42, h * 0.04);
    ctx.quadraticCurveTo(0, h * 0.12, w * 0.42, h * 0.04);
    ctx.stroke();

    // Thin secondary stripe
    ctx.strokeStyle = stripeColor;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(-w * 0.38, h * 0.1);
    ctx.quadraticCurveTo(0, h * 0.17, w * 0.38, h * 0.1);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Cabin windows
    const windowY = -h * 0.04;
    for (let i = 0; i < 4; i++) {
      const wx = -w * 0.12 + i * w * 0.09;
      // Window frame
      ctx.fillStyle = "#0D47A1";
      ctx.beginPath();
      ctx.arc(wx, windowY, 2.2, 0, Math.PI * 2);
      ctx.fill();
      // Window glass
      const windowGrad = ctx.createRadialGradient(wx - 0.5, windowY - 0.5, 0, wx, windowY, 2);
      windowGrad.addColorStop(0, "#90CAF9");
      windowGrad.addColorStop(1, "#1565C0");
      ctx.fillStyle = windowGrad;
      ctx.beginPath();
      ctx.arc(wx, windowY, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // === WINGS ===
    // Top wing - swept back
    const topWingGrad = ctx.createLinearGradient(0, -h * 0.65, 0, -h * 0.1);
    topWingGrad.addColorStop(0, "#D0D0D0");
    topWingGrad.addColorStop(0.5, "#BDBDBD");
    topWingGrad.addColorStop(1, "#9E9E9E");
    ctx.fillStyle = topWingGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.1, -h * 0.12);
    ctx.lineTo(w * 0.0, -h * 0.65);
    ctx.lineTo(w * 0.15, -h * 0.62);
    ctx.lineTo(w * 0.22, -h * 0.55);
    ctx.lineTo(w * 0.18, -h * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Wing tip color
    ctx.fillStyle = stripeColor;
    ctx.beginPath();
    ctx.moveTo(w * 0.0, -h * 0.65);
    ctx.lineTo(w * 0.15, -h * 0.62);
    ctx.lineTo(w * 0.22, -h * 0.55);
    ctx.lineTo(w * 0.18, -h * 0.50);
    ctx.lineTo(w * 0.06, -h * 0.56);
    ctx.closePath();
    ctx.fill();

    // Wing detail line (aileron)
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(w * 0.0, -h * 0.35);
    ctx.lineTo(w * 0.18, -h * 0.32);
    ctx.stroke();

    // Bottom wing
    const botWingGrad = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.65);
    botWingGrad.addColorStop(0, "#AAAAAA");
    botWingGrad.addColorStop(1, "#888888");
    ctx.fillStyle = botWingGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.1, h * 0.12);
    ctx.lineTo(w * 0.0, h * 0.65);
    ctx.lineTo(w * 0.15, h * 0.62);
    ctx.lineTo(w * 0.22, h * 0.55);
    ctx.lineTo(w * 0.18, h * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#777";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Bottom wing tip color
    ctx.fillStyle = stripeColor;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(w * 0.0, h * 0.65);
    ctx.lineTo(w * 0.15, h * 0.62);
    ctx.lineTo(w * 0.22, h * 0.55);
    ctx.lineTo(w * 0.18, h * 0.50);
    ctx.lineTo(w * 0.06, h * 0.56);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // === COCKPIT ===
    // Windshield
    const windshieldGrad = ctx.createRadialGradient(
      w * 0.34, -h * 0.08, 0,
      w * 0.32, -h * 0.02, w * 0.15,
    );
    windshieldGrad.addColorStop(0, "#B3E5FC");
    windshieldGrad.addColorStop(0.4, "#4FC3F7");
    windshieldGrad.addColorStop(0.8, "#0288D1");
    windshieldGrad.addColorStop(1, "#01579B");
    ctx.fillStyle = windshieldGrad;
    ctx.beginPath();
    ctx.ellipse(w * 0.32, -h * 0.02, w * 0.14, h * 0.2, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#01579B";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Windshield frame line
    ctx.strokeStyle = "rgba(1,87,155,0.5)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(w * 0.32, -h * 0.22);
    ctx.lineTo(w * 0.32, h * 0.18);
    ctx.stroke();

    // Windshield reflections
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(w * 0.36, -h * 0.12, w * 0.035, h * 0.06, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.ellipse(w * 0.28, h * 0.04, w * 0.02, h * 0.04, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // === NOSE ===
    const noseGrad = ctx.createLinearGradient(w * 0.45, -h * 0.12, w * 0.45, h * 0.12);
    noseGrad.addColorStop(0, "#B0B0B0");
    noseGrad.addColorStop(0.3, "#909090");
    noseGrad.addColorStop(0.7, "#707070");
    noseGrad.addColorStop(1, "#555555");
    ctx.fillStyle = noseGrad;
    ctx.beginPath();
    ctx.moveTo(w * 0.46, -h * 0.08);
    ctx.quadraticCurveTo(w * 0.62, 0, w * 0.46, h * 0.08);
    ctx.lineTo(w * 0.46, -h * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Nose highlight
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#FFF";
    ctx.beginPath();
    ctx.ellipse(w * 0.50, -h * 0.03, w * 0.04, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // === PROPELLER ===
    const propAngle = this.frameCount * 0.5;
    ctx.save();
    ctx.translate(w * 0.58, 0);

    // Propeller disc (motion blur effect)
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#888";
    ctx.beginPath();
    ctx.ellipse(0, 0, 3, h * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Propeller blades
    ctx.rotate(propAngle);
    for (let b = 0; b < 3; b++) {
      ctx.rotate(Math.PI * 2 / 3);
      const bladeGrad = ctx.createLinearGradient(0, -h * 0.4, 0, 0);
      bladeGrad.addColorStop(0, "#666");
      bladeGrad.addColorStop(1, "#333");
      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.quadraticCurveTo(-3, -h * 0.2, -1.5, -h * 0.4);
      ctx.lineTo(1.5, -h * 0.4);
      ctx.quadraticCurveTo(3, -h * 0.2, 2, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Spinner hub
    const hubGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 4);
    hubGrad.addColorStop(0, "#AAA");
    hubGrad.addColorStop(0.6, "#777");
    hubGrad.addColorStop(1, "#555");
    ctx.fillStyle = hubGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();

    ctx.restore();
  }

  // === SCORE ===

  private drawScore(score: number): void {
    const ctx = this.ctx;
    const text = String(score);

    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";

    // Outer glow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;

    // Dark outline
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.strokeText(text, CANVAS_WIDTH / 2, 56);

    // White text on top
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(text, CANVAS_WIDTH / 2, 56);
    ctx.restore();
  }
}
