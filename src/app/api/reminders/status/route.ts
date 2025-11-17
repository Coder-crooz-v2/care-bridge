import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    // Check if there are any active reminders for this medicine
    const { data, error } = await supabase
      .from("medicine_reminders")
      .select("id")
      .eq("medicine_id", medicine_id)
      .eq("is_active", true)
      .limit(1);

    if (error) {
      console.error("Error checking reminder status:", error);
      return NextResponse.json(
        { error: "Failed to check reminder status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasActiveReminder: data && data.length > 0,
    });
  } catch (error) {
    console.error("Check reminder status error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to check reminder status",
      },
      { status: 500 }
    );
  }
}
