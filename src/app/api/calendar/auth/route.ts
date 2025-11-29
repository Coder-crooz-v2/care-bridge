import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/services/googleCalendarService";

/**
 * GET /api/calendar/auth
 * Redirects user to Google OAuth consent screen
 */
export async function GET(request: NextRequest) {
  try {
    const authUrl = getAuthorizationUrl();

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate authorization URL",
      },
      { status: 500 }
    );
  }
}
