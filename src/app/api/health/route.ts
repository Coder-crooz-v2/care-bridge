import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Simulate a health check
    const healthCheck = {
      status: "ok",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(healthCheck);
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}
