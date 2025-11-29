import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { updateUserCalendarTokens } from "@/controllers/googleCalendarController";

/**
 * DELETE /api/calendar/disconnect
 * Disconnect Google Calendar from user account
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete tokens from database
    const { error } = await supabase
      .from("user_calendar_tokens")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", "google");

    if (error) {
      console.error("Error disconnecting calendar:", error);
      return NextResponse.json(
        { error: "Failed to disconnect calendar" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Google Calendar disconnected successfully",
    });
  } catch (error) {
    console.error("Error in calendar disconnect:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to disconnect calendar",
      },
      { status: 500 }
    );
  }
}
