import { Pipe } from "./pipe";

export class ScoreSystem {
  private _score: number = 0;

  get score(): number {
    return this._score;
  }

  /**
   * Check if the plane has passed any pipes and increment score.
   * Returns an array of indices of newly-passed pipes.
   * The caller is responsible for marking pipes as passed.
   */
  update(planeX: number, pipes: Pipe[]): number[] {
    const passedIndices: number[] = [];
    for (let i = 0; i < pipes.length; i++) {
      const pipe = pipes[i];
      if (!pipe.passed && planeX > pipe.x + pipe.width) {
        passedIndices.push(i);
        this._score += 1;
      }
    }
    return passedIndices;
  }

  reset(): void {
    this._score = 0;
  }
}
