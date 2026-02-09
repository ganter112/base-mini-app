import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getUserScoreByAddress, submitScoreByAddress } from "../../../lib/scores";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address || !isAddress(address)) {
    return NextResponse.json({ message: "Invalid address" }, { status: 400 });
  }

  try {
    const score = await getUserScoreByAddress(address);
    return NextResponse.json({ score });
  } catch {
    return NextResponse.json({ score: 0 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { score, address } = body;

    if (!address || !isAddress(address)) {
      return NextResponse.json({ message: "Invalid address" }, { status: 400 });
    }

    if (!score || score < 0 || score > 100000) {
      return NextResponse.json({ message: "Invalid score" }, { status: 400 });
    }

    const updated = await submitScoreByAddress(address, score);
    return NextResponse.json({ updated, score });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
