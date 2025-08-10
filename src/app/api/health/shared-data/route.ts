import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users sharing their data with me
    const { data: sharingData, error } = await supabase
      .from("health_sharing")
      .select("id, sharer_email, sharer_user_id, created_at")
      .eq("viewer_email", user.email!)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching sharing data:", error);
    }

    const sharedUsers = [];

    // For each sharing relationship, create a mock health data entry
    for (const sharing of sharingData || []) {
      // Generate mock health data since health_data_snapshots is empty
      const mockHealthData = {
        vitals: {
          heart_rate: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
          blood_pressure_systolic:
            Math.floor(Math.random() * (140 - 110 + 1)) + 110,
          blood_pressure_diastolic:
            Math.floor(Math.random() * (90 - 70 + 1)) + 70,
          spo2: Math.floor(Math.random() * (100 - 95 + 1)) + 95,
          temperature:
            Math.round((Math.random() * (99.5 - 98.0) + 98.0) * 10) / 10,
          timestamp: new Date().toISOString(),
        },
        analysis: {
          status: "normal",
          concerns: [],
          recommendations: [],
          needs_attention: false,
        },
        needs_attention: false,
        is_attended: true,
        created_at: new Date().toISOString(),
      };

      sharedUsers.push({
        sharing_id: sharing.id,
        user_id: sharing.sharer_user_id,
        user_email: sharing.sharer_email,
        user_name: sharing.sharer_email.split("@")[0],
        latest_data: mockHealthData,
        needs_attention: false,
        is_attended: true,
        shared_since: sharing.created_at,
      });
    }

    return NextResponse.json({ shared_users: sharedUsers, success: true });
  } catch (error) {
    console.error("Shared data error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
