import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isCalendarConnected } from "@/controllers/googleCalendarController";

/**
 * GET /api/calendar/status
 * Check if user has connected their Google Calendar
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connected = await isCalendarConnected(user.id);

    return NextResponse.json({
      success: true,
      connected,
    });
  } catch (error) {
    console.error("Error checking calendar status:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to check calendar status",
      },
      { status: 500 }
    );
  }
}
