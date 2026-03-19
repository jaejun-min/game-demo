import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

export interface ScoreEntry {
  name: string;
  score: number;
}

const SCORES_PATH = join(process.cwd(), "data", "scores.json");

export function readScores(): ScoreEntry[] {
  try {
    const data = readFileSync(SCORES_PATH, "utf-8");
    return JSON.parse(data) as ScoreEntry[];
  } catch {
    return [];
  }
}

export function writeScores(scores: ScoreEntry[]): void {
  // W3: Ensure data directory exists
  mkdirSync(dirname(SCORES_PATH), { recursive: true });
  writeFileSync(SCORES_PATH, JSON.stringify(scores, null, 2), "utf-8");
}

// W2: In-process mutex to prevent race conditions on file writes
let writeLock: Promise<void> = Promise.resolve();

export async function addScore(name: string, score: number): Promise<ScoreEntry[]> {
  let result: ScoreEntry[] = [];
  writeLock = writeLock.then(async () => {
    const scores = readScores();
    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score);
    const top10 = scores.slice(0, 10);
    writeScores(top10);
    result = top10;
  });
  await writeLock;
  return result;
}

export function getTopScores(): ScoreEntry[] {
  const scores = readScores();
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 10);
}
