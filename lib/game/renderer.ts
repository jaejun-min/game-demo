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

  // === OBSTACLES (Laser Gates) ===

  private drawPipes(pipes: Pipe[], _theme: ThemeName): void {
    const ctx = this.ctx;

    for (const pipe of pipes) {
      const top = pipe.getTopRect();
      const bottom = pipe.getBottomRect();

      this.drawLaserColumn(ctx, top, false);
      this.drawLaserColumn(ctx, bottom, true);

      // Warning emitters at gap edges
      this.drawGateEmitter(ctx, top, bottom);
    }
  }

  private drawLaserColumn(
    ctx: CanvasRenderingContext2D,
    rect: { x: number; y: number; width: number; height: number },
    isBottom: boolean,
  ): void {
    const { x, y, width, height } = rect;
    const pulse = 0.7 + Math.sin(this.frameCount * 0.06) * 0.2;

    // Outer red glow (wide, faint - makes it pop against navy)
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#FF3D00";
    ctx.fillRect(x - 8, y, width + 16, height);
    ctx.restore();

    // Column body - dark with red tint
    const bodyGrad = ctx.createLinearGradient(x, 0, x + width, 0);
    bodyGrad.addColorStop(0, "rgba(60,15,15,0.95)");
    bodyGrad.addColorStop(0.2, "rgba(80,20,20,0.9)");
    bodyGrad.addColorStop(0.5, "rgba(70,18,18,0.95)");
    bodyGrad.addColorStop(0.8, "rgba(80,20,20,0.9)");
    bodyGrad.addColorStop(1, "rgba(60,15,15,0.95)");
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(x, y, width, height);

    // Warning chevron stripes (diagonal hazard pattern)
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    const stripeSpacing = 18;
    ctx.strokeStyle = "rgba(255,160,0,0.12)";
    ctx.lineWidth = 6;
    const chevronStart = isBottom ? y : y + (height % stripeSpacing);
    for (let sy = chevronStart; sy < y + height; sy += stripeSpacing) {
      ctx.beginPath();
      ctx.moveTo(x - 5, sy);
      ctx.lineTo(x + width + 5, sy + stripeSpacing);
      ctx.stroke();
    }
    ctx.restore();

    // Border (bright red edge for visibility)
    ctx.strokeStyle = "rgba(255,60,30,0.5)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, width, height);

    // Center laser beam
    const beamW = 3;
    const beamX = x + width / 2 - beamW / 2;

    // Beam glow (wide)
    ctx.save();
    ctx.globalAlpha = pulse * 0.25;
    ctx.fillStyle = "#FF1744";
    ctx.fillRect(x + width / 2 - 10, y, 20, height);
    ctx.restore();

    // Beam core
    ctx.save();
    ctx.globalAlpha = pulse * 0.9;
    ctx.fillStyle = "#FF5252";
    ctx.fillRect(beamX, y, beamW, height);
    ctx.restore();

    // Beam bright center
    ctx.save();
    ctx.globalAlpha = pulse * 0.7;
    ctx.fillStyle = "#FFCDD2";
    ctx.fillRect(beamX + 0.5, y, 2, height);
    ctx.restore();

    // Side warning lights (small dots along edges)
    const lightSpacing = 40;
    for (let ly = y + 20; ly < y + height - 10; ly += lightSpacing) {
      const lightPulse = 0.3 + Math.sin(this.frameCount * 0.08 + ly * 0.1) * 0.4;
      // Left light
      ctx.save();
      ctx.globalAlpha = lightPulse;
      ctx.fillStyle = "#FFA000";
      ctx.beginPath();
      ctx.arc(x + 4, ly, 2, 0, Math.PI * 2);
      ctx.fill();
      // Right light
      ctx.beginPath();
      ctx.arc(x + width - 4, ly, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Emitter cap at gap edge
    const capH = 10;
    const capY = isBottom ? y : y + height - capH;
    const capOverhang = 6;
    const capX = x - capOverhang;
    const capW = width + capOverhang * 2;

    // Cap body - bright orange/red for visibility
    const capGrad = ctx.createLinearGradient(capX, 0, capX + capW, 0);
    capGrad.addColorStop(0, "#8B2500");
    capGrad.addColorStop(0.3, "#D84315");
    capGrad.addColorStop(0.5, "#FF5722");
    capGrad.addColorStop(0.7, "#D84315");
    capGrad.addColorStop(1, "#8B2500");
    ctx.fillStyle = capGrad;
    ctx.fillRect(capX, capY, capW, capH);

    // Cap highlight
    ctx.fillStyle = "rgba(255,200,150,0.2)";
    ctx.fillRect(capX + 3, capY + 1, capW - 6, 3);

    // Cap border
    ctx.strokeStyle = "#BF360C";
    ctx.lineWidth = 1;
    ctx.strokeRect(capX, capY, capW, capH);

    // Cap laser emission glow
    ctx.save();
    ctx.globalAlpha = pulse * 0.5;
    ctx.fillStyle = "#FF1744";
    const emitY = isBottom ? capY : capY + capH - 2;
    ctx.fillRect(capX, emitY, capW, 2);
    ctx.restore();
  }

  private drawGateEmitter(
    ctx: CanvasRenderingContext2D,
    top: { x: number; y: number; width: number; height: number },
    bottom: { x: number; y: number; width: number; height: number },
  ): void {
    // Scanning laser line across the gap (horizontal)
    const gapTop = top.y + top.height;
    const gapBottom = bottom.y;
    const gapHeight = gapBottom - gapTop;
    const scanY = gapTop + (Math.sin(this.frameCount * 0.03) * 0.3 + 0.5) * gapHeight;

    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "#FF1744";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(top.x - 5, scanY);
    ctx.lineTo(top.x + top.width + 5, scanY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
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

    // Draw dual trail (engine contrails) - bright cyan
    const trailColor = "rgba(0,229,255,";

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

    const rotation = Math.max(-0.5, Math.min(0.5, plane.velocityY * 0.002));

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    const w = plane.width;
    const h = plane.height;

    // Bright cyan accent for visibility against dark bg
    const neon = { core: "#00E5FF", glow: "rgba(0,229,255," };

    // === JET EXHAUST (dynamic) ===
    const isRising = plane.velocityY < -50;
    const exhaustScale = isRising ? 1.4 : 0.6;
    const exhaustPulse = (0.5 + Math.sin(this.frameCount * 0.35) * 0.3) * (isRising ? 1.0 : 0.5);

    // Outer afterburner glow
    ctx.save();
    ctx.globalAlpha = exhaustPulse * 0.4;
    const outerAB = ctx.createRadialGradient(-w * 0.6, 0, 0, -w * 0.6, 0, w * 0.45 * exhaustScale);
    outerAB.addColorStop(0, neon.glow + "0.5)");
    outerAB.addColorStop(0.5, neon.glow + "0.15)");
    outerAB.addColorStop(1, neon.glow + "0)");
    ctx.fillStyle = outerAB;
    ctx.beginPath();
    ctx.ellipse(-w * 0.6, 0, w * 0.45 * exhaustScale, h * 0.18 * exhaustScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Inner jet flame
    ctx.save();
    ctx.globalAlpha = exhaustPulse;
    const innerAB = ctx.createRadialGradient(-w * 0.52, 0, 0, -w * 0.52, 0, w * 0.25 * exhaustScale);
    innerAB.addColorStop(0, "rgba(255,255,255,0.9)");
    innerAB.addColorStop(0.25, neon.glow + "0.7)");
    innerAB.addColorStop(0.6, neon.glow + "0.3)");
    innerAB.addColorStop(1, neon.glow + "0)");
    ctx.fillStyle = innerAB;
    ctx.beginPath();
    ctx.ellipse(-w * 0.52, 0, w * 0.25 * exhaustScale, h * 0.1 * exhaustScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // === AMBIENT GLOW (makes plane pop against dark bg) ===
    ctx.save();
    ctx.globalAlpha = 0.08;
    const ambientGlow = ctx.createRadialGradient(0, 0, w * 0.1, 0, 0, w * 0.8);
    ambientGlow.addColorStop(0, neon.glow + "0.4)");
    ambientGlow.addColorStop(1, neon.glow + "0)");
    ctx.fillStyle = ambientGlow;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // === TWIN TAIL FINS ===
    ctx.fillStyle = "#C0C8D8";
    ctx.beginPath();
    ctx.moveTo(-w * 0.32, -h * 0.08);
    ctx.lineTo(-w * 0.48, -h * 0.55);
    ctx.lineTo(-w * 0.40, -h * 0.52);
    ctx.lineTo(-w * 0.25, -h * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.fillStyle = "#B0B8C8";
    ctx.beginPath();
    ctx.moveTo(-w * 0.32, h * 0.08);
    ctx.lineTo(-w * 0.48, h * 0.55);
    ctx.lineTo(-w * 0.40, h * 0.52);
    ctx.lineTo(-w * 0.25, h * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Fin accent strips
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = neon.core;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-w * 0.44, -h * 0.48);
    ctx.lineTo(-w * 0.28, -h * 0.08);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-w * 0.44, h * 0.48);
    ctx.lineTo(-w * 0.28, h * 0.08);
    ctx.stroke();
    ctx.restore();

    // === JET NOZZLE ===
    const nozzleGrad = ctx.createLinearGradient(-w * 0.48, -h * 0.14, -w * 0.48, h * 0.14);
    nozzleGrad.addColorStop(0, "#8090A0");
    nozzleGrad.addColorStop(0.4, "#A0ADB8");
    nozzleGrad.addColorStop(0.6, "#8898A8");
    nozzleGrad.addColorStop(1, "#708090");
    ctx.fillStyle = nozzleGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.38, -h * 0.1);
    ctx.lineTo(-w * 0.50, -h * 0.14);
    ctx.lineTo(-w * 0.50, h * 0.14);
    ctx.lineTo(-w * 0.38, h * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Nozzle inner glow
    ctx.strokeStyle = neon.core;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.5 + exhaustPulse * 0.3;
    ctx.beginPath();
    ctx.moveTo(-w * 0.49, -h * 0.1);
    ctx.lineTo(-w * 0.49, h * 0.1);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // === DELTA WINGS (bright) ===
    const topWingGrad = ctx.createLinearGradient(0, -h * 0.1, 0, -h * 0.7);
    topWingGrad.addColorStop(0, "#D0D8E0");
    topWingGrad.addColorStop(0.5, "#B8C4D0");
    topWingGrad.addColorStop(1, "#A0B0C0");
    ctx.fillStyle = topWingGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.15, -h * 0.08);
    ctx.lineTo(-w * 0.05, -h * 0.7);
    ctx.lineTo(w * 0.2, -h * 0.6);
    ctx.lineTo(w * 0.15, -h * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Wing edge neon
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = neon.core;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-w * 0.05, -h * 0.7);
    ctx.lineTo(w * 0.2, -h * 0.6);
    ctx.stroke();
    ctx.restore();

    // Bottom wing
    const botWingGrad = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.7);
    botWingGrad.addColorStop(0, "#B0B8C8");
    botWingGrad.addColorStop(1, "#8898A8");
    ctx.fillStyle = botWingGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.15, h * 0.08);
    ctx.lineTo(-w * 0.05, h * 0.7);
    ctx.lineTo(w * 0.2, h * 0.6);
    ctx.lineTo(w * 0.15, h * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Bottom wing edge neon
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = neon.core;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-w * 0.05, h * 0.7);
    ctx.lineTo(w * 0.2, h * 0.6);
    ctx.stroke();
    ctx.restore();

    // === FUSELAGE (bright white/silver) ===
    const bodyGrad = ctx.createLinearGradient(0, -h * 0.25, 0, h * 0.25);
    bodyGrad.addColorStop(0, "#F0F4F8");
    bodyGrad.addColorStop(0.2, "#E4E8EE");
    bodyGrad.addColorStop(0.5, "#D8DEE6");
    bodyGrad.addColorStop(0.8, "#C8D0DA");
    bodyGrad.addColorStop(1, "#B0BAC8");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    // Angular fuselage shape (diamond-ish cross section)
    ctx.moveTo(-w * 0.42, 0);           // tail center
    ctx.lineTo(-w * 0.2, -h * 0.2);     // tail top edge
    ctx.lineTo(w * 0.15, -h * 0.18);    // mid top
    ctx.lineTo(w * 0.52, -h * 0.05);    // nose top
    ctx.lineTo(w * 0.58, 0);            // nose tip
    ctx.lineTo(w * 0.52, h * 0.05);     // nose bottom
    ctx.lineTo(w * 0.15, h * 0.18);     // mid bottom
    ctx.lineTo(-w * 0.2, h * 0.2);      // tail bottom edge
    ctx.closePath();
    ctx.fill();

    // Body edge highlight (top)
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-w * 0.2, -h * 0.2);
    ctx.lineTo(w * 0.15, -h * 0.18);
    ctx.lineTo(w * 0.52, -h * 0.05);
    ctx.stroke();

    // Body outline
    ctx.strokeStyle = "rgba(100,130,170,0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center ridge line
    ctx.strokeStyle = "rgba(160,180,200,0.25)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, 0);
    ctx.lineTo(w * 0.50, 0);
    ctx.stroke();

    // Panel lines
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.0, -h * 0.19);
    ctx.lineTo(w * 0.0, h * 0.19);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-w * 0.2, -h * 0.18);
    ctx.lineTo(-w * 0.2, h * 0.18);
    ctx.stroke();

    // Side neon accent line
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = neon.core;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, h * 0.02);
    ctx.lineTo(w * 0.40, h * 0.02);
    ctx.stroke();
    ctx.restore();

    // Secondary thin neon
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = neon.core;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-w * 0.30, h * 0.08);
    ctx.lineTo(w * 0.30, h * 0.08);
    ctx.stroke();
    ctx.restore();

    // === CANOPY (fighter jet bubble) ===
    const canopyGrad = ctx.createRadialGradient(
      w * 0.22, -h * 0.1, 0,
      w * 0.20, -h * 0.04, w * 0.16,
    );
    canopyGrad.addColorStop(0, "rgba(180,230,255,0.9)");
    canopyGrad.addColorStop(0.3, "rgba(100,200,255,0.7)");
    canopyGrad.addColorStop(0.7, "rgba(40,130,200,0.6)");
    canopyGrad.addColorStop(1, "rgba(10,60,120,0.8)");
    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    // Angular canopy shape
    ctx.moveTo(w * 0.05, -h * 0.15);
    ctx.quadraticCurveTo(w * 0.25, -h * 0.25, w * 0.38, -h * 0.08);
    ctx.lineTo(w * 0.38, h * 0.02);
    ctx.quadraticCurveTo(w * 0.25, h * 0.08, w * 0.05, h * 0.02);
    ctx.closePath();
    ctx.fill();

    // Canopy frame
    ctx.strokeStyle = "rgba(60,100,160,0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Canopy frame line (divider)
    ctx.strokeStyle = "rgba(60,100,160,0.4)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(w * 0.22, -h * 0.23);
    ctx.lineTo(w * 0.22, h * 0.06);
    ctx.stroke();

    // Canopy reflection
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(w * 0.28, -h * 0.14, w * 0.04, h * 0.05, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.ellipse(w * 0.14, -h * 0.04, w * 0.03, h * 0.03, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // === NOSE TIP ===
    ctx.fillStyle = "#C0C8D4";
    ctx.beginPath();
    ctx.moveTo(w * 0.50, -h * 0.05);
    ctx.lineTo(w * 0.62, 0);
    ctx.lineTo(w * 0.50, h * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(160,180,200,0.5)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Nose tip neon dot
    ctx.save();
    ctx.globalAlpha = 0.6 + Math.sin(this.frameCount * 0.1) * 0.3;
    ctx.fillStyle = neon.core;
    ctx.beginPath();
    ctx.arc(w * 0.58, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();
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
