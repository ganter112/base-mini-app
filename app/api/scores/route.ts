import { createClient } from "@farcaster/quick-auth";
import { NextRequest, NextResponse } from "next/server";
import { getUserScore, submitScore } from "../../lib/scores";

const client = createClient();

function getUrlHost(request: NextRequest): string {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host;
    } catch {}
  }
  const host = request.headers.get("host");
  if (host) return host;

  let urlValue: string;
  if (process.env.VERCEL_ENV === "production") {
    urlValue = process.env.NEXT_PUBLIC_URL!;
  } else if (process.env.VERCEL_URL) {
    urlValue = `https://${process.env.VERCEL_URL}`;
  } else {
    urlValue = "http://localhost:3000";
  }
  return new URL(urlValue).host;
}

async function authenticateRequest(request: NextRequest): Promise<number | null> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  try {
    const payload = await client.verifyJwt({
      token: authorization.split(" ")[1],
      domain: getUrlHost(request),
    });
    return Number(payload.sub);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const fid = await authenticateRequest(request);
  if (!fid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const score = await getUserScore(fid);
    return NextResponse.json({ score });
  } catch {
    return NextResponse.json({ score: 0 });
  }
}

export async function POST(request: NextRequest) {
  const fid = await authenticateRequest(request);
  if (!fid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const score = Number(body.score);

    if (!score || score < 0 || score > 100000) {
      return NextResponse.json({ message: "Invalid score" }, { status: 400 });
    }

    const updated = await submitScore(fid, score, body.displayName);
    return NextResponse.json({ updated, score });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
