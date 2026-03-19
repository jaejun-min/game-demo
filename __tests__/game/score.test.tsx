import { describe, it, expect } from "vitest";
import { ScoreSystem } from "@/lib/game/score";
import { Pipe } from "@/lib/game/pipe";

describe("ScoreSystem", () => {
  it("should start with score 0", () => {
    const score = new ScoreSystem();
    expect(score.score).toBe(0);
  });

  it("should increment score when plane passes a pipe", () => {
    const score = new ScoreSystem();
    const pipe = new Pipe(200);
    pipe.x = 50; // pipe at x=50, width=60, right edge=110
    const planeX = 120; // plane is past the pipe's right edge

    const passedIndices = score.update(planeX, [pipe]);
    expect(score.score).toBe(1);
    expect(passedIndices).toEqual([0]);
    // Caller marks as passed
    for (const i of passedIndices) [pipe][i].passed = true;
    expect(pipe.passed).toBe(true);
  });

  it("should not re-count already passed pipes", () => {
    const score = new ScoreSystem();
    const pipe = new Pipe(200);
    pipe.x = 50;
    const planeX = 120;

    const passedIndices = score.update(planeX, [pipe]);
    for (const i of passedIndices) [pipe][i].passed = true;
    expect(score.score).toBe(1);

    // Update again with same pipe (already marked passed by caller)
    score.update(planeX, [pipe]);
    expect(score.score).toBe(1); // should still be 1
  });

  it("should not count pipe if plane has not passed it yet", () => {
    const score = new ScoreSystem();
    const pipe = new Pipe(200);
    pipe.x = 200; // pipe right edge at 260
    const planeX = 100; // plane is before the pipe

    const passedIndices = score.update(planeX, [pipe]);
    expect(score.score).toBe(0);
    expect(passedIndices).toEqual([]);
    expect(pipe.passed).toBe(false);
  });

  it("should count multiple pipes independently", () => {
    const score = new ScoreSystem();
    const pipe1 = new Pipe(200);
    pipe1.x = 50;
    const pipe2 = new Pipe(300);
    pipe2.x = 100;
    const planeX = 200;

    const passedIndices = score.update(planeX, [pipe1, pipe2]);
    expect(score.score).toBe(2);
    expect(passedIndices).toEqual([0, 1]);
  });

  it("should reset score", () => {
    const score = new ScoreSystem();
    const pipe = new Pipe(200);
    pipe.x = 50;
    const passedIndices = score.update(120, [pipe]);
    for (const i of passedIndices) [pipe][i].passed = true;
    expect(score.score).toBe(1);

    score.reset();
    expect(score.score).toBe(0);
  });

  it("should return newly-passed pipe indices without mutating pipe.passed", () => {
    const score = new ScoreSystem();
    const pipe = new Pipe(200);
    pipe.x = 50;
    const planeX = 120;

    const passedIndices = score.update(planeX, [pipe]);
    // ScoreSystem no longer mutates pipe.passed directly
    expect(passedIndices).toEqual([0]);
    // pipe.passed is still false until the caller marks it
    expect(pipe.passed).toBe(false);
  });
});
