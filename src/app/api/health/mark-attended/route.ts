import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, attended_by } = body;

    // Create alert record
    const { error: alertError } = await supabase.from("health_alerts").insert([
      {
        user_id,
        alert_type: "attended",
        status: "acknowledged",
        message: "User has been attended to",
        attended_by,
      },
    ]);

    if (alertError) {
      console.error("Error creating alert record:", alertError);
      return NextResponse.json(
        { error: "Failed to record attendance" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User marked as attended",
    });
  } catch (error) {
    console.error("Mark attended error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
