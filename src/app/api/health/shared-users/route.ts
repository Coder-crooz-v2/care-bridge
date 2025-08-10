import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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
    const userId = url.searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get shared users (people who share their data with this user)
    const { data: sharedUsers, error } = await supabase
      .from("health_sharing")
      .select(
        `
        sharer_user_id,
        user_profiles!health_sharing_sharer_user_id_fkey (
          email,
          full_name
        )
      `
      )
      .eq("target_user_id", userId)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching shared users:", error);
      return NextResponse.json(
        { error: "Failed to fetch shared users" },
        { status: 500 }
      );
    }

    // Format response
    const formattedUsers = (sharedUsers || []).map((share) => ({
      user_id: share.sharer_user_id,
      user_email: share.user_profiles?.[0]?.email || "Unknown",
      user_name: share.user_profiles?.[0]?.full_name || "Unknown User",
      needs_attention: false, // Will be updated by WebSocket
      is_attended: false,
      latest_data: null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    console.error("Get shared users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
