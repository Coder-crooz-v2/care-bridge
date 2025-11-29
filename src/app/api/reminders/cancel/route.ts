import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { deleteMedicineCalendarEvents } from "@/controllers/googleCalendarController";

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { searchParams } = new URL(request.url);
    const medicine_id = searchParams.get("medicine_id");

    if (!medicine_id) {
      return NextResponse.json(
        { error: "Medicine ID is required" },
        { status: 400 }
      );
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: Delete Google Calendar events if they exist
    try {
      await deleteMedicineCalendarEvents(medicine_id, user.id);
      console.log("Calendar events deleted successfully");
    } catch (calendarError) {
      // Don't fail the whole request if calendar deletion fails
      console.error("Failed to delete calendar events:", calendarError);
    }

    // Deactivate reminders instead of deleting them (for audit trail)
    const { error } = await supabase
      .from("medicine_reminders")
      .update({ is_active: false })
      .eq("medicine_id", medicine_id);

    if (error) {
      console.error("Error canceling reminders:", error);
      return NextResponse.json(
        { error: "Failed to cancel reminders" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reminders canceled successfully",
    });
  } catch (error) {
    console.error("Cancel reminder error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to cancel reminder",
      },
      { status: 500 }
    );
  }
}
