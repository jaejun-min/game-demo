import { CANVAS_HEIGHT, PIPE_SPAWN_INTERVAL } from "./constants";
import { Pipe } from "./pipe";

export class PipeSpawner {
  private timeSinceLastSpawn: number = 0;
  private spawnInterval: number = PIPE_SPAWN_INTERVAL;

  /**
   * Update the spawner with delta time.
   * Returns a new Pipe if it's time to spawn, otherwise null.
   */
  update(dt: number, gapSize: number): Pipe | null {
    this.timeSinceLastSpawn += dt;

    if (this.timeSinceLastSpawn >= this.spawnInterval) {
      this.timeSinceLastSpawn -= this.spawnInterval;
      return this.spawnPipe(gapSize);
    }

    return null;
  }

  private spawnPipe(gapSize: number): Pipe {
    // Gap center should be within a safe zone to keep both pipe halves visible
    const minGapY = 50;
    const maxGapY = CANVAS_HEIGHT - gapSize - 50;
    const gapY = minGapY + Math.random() * (maxGapY - minGapY);
    return new Pipe(gapY, gapSize);
  }

  reset(): void {
    this.timeSinceLastSpawn = 0;
  }

  /** Force a spawn immediately (useful for testing) */
  forceSpawn(gapSize: number): Pipe {
    this.timeSinceLastSpawn = 0;
    return this.spawnPipe(gapSize);
  }
}
