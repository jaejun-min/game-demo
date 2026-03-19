import { NextResponse } from "next/server";
import { getTopScores, addScore } from "@/lib/leaderboard";

export async function GET() {
  const scores = getTopScores();
  return NextResponse.json(scores);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { name } = body;
    const { score } = body;

    // Validate name type
    if (typeof name !== "string") {
      return NextResponse.json(
        { error: "Name must be a non-empty string" },
        { status: 400 },
      );
    }

    // C2: Sanitize name - strip HTML tags, restrict to safe characters
    name = name.replace(/<[^>]*>/g, "");
    name = name.replace(/[^a-zA-Z0-9\s\-_\uAC00-\uD7AF\u3131-\u3163]/g, "");
    name = name.trim();

    if (name.length === 0) {
      return NextResponse.json(
        { error: "Name must be a non-empty string" },
        { status: 400 },
      );
    }

    if (name.length > 20) {
      return NextResponse.json(
        { error: "Name must be at most 20 characters" },
        { status: 400 },
      );
    }

    // Validate score
    if (typeof score !== "number" || !Number.isInteger(score) || score < 0) {
      return NextResponse.json(
        { error: "Score must be a positive integer" },
        { status: 400 },
      );
    }

    // C3: Score upper bound
    if (score > 9999) {
      return NextResponse.json(
        { error: "Score must be at most 9999" },
        { status: 400 },
      );
    }

    const updatedScores = await addScore(name, score);
    return NextResponse.json(updatedScores);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
