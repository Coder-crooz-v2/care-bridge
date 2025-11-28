import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Get list of users who have shared data with current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get sharing records where current user is the recipient
    const { data: shares, error: sharesError } = await supabase
      .from("health_data_sharing")
      .select(
        `
        id,
        user_id,
        created_at,
        profiles!health_data_sharing_user_id_fkey1 (
          id,
          email
        )
      `
      )
      .eq("shared_to", user.id);

    if (sharesError) {
      return NextResponse.json(
        { error: "Failed to fetch shared data" },
        { status: 500 }
      );
    }

    // Transform data
    const transformedShares = (shares || []).map((share: any) => {
      // Normalize profiles to always treat as array-like
      const profiles = share.profiles;
      const profile = Array.isArray(profiles) ? profiles[0] : profiles;

      return {
        id: share.id,
        sharedBy: {
          id: profile?.id ?? share.user_id,
          email: profile?.email ?? null,
        },
        createdAt: share.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedShares,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
