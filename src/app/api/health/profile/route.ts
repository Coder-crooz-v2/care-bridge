import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET health profile
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id") || user.id;

    const { data: profile, error } = await supabase
      .from("user_health_profile")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // Not found is ok
      console.error("Error fetching health profile:", error);
      return NextResponse.json(
        { error: "Failed to fetch health profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get health profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST/PUT health profile
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
    const profileData = {
      user_id: user.id,
      is_female: body.is_female || false,
      notification_preferences: body.notification_preferences || {
        email_alerts: true,
        sms_alerts: false,
        push_notifications: true,
      },
      emergency_contacts: body.emergency_contacts || [],
      medical_conditions: body.medical_conditions || [],
      medications: body.medications || [],
    };

    // Upsert (insert or update) profile
    const { data: profile, error } = await supabase
      .from("user_health_profile")
      .upsert([profileData], {
        onConflict: "user_id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error upserting health profile:", error);
      return NextResponse.json(
        { error: "Failed to update health profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Update health profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
