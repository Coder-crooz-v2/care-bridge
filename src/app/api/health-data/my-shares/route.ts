import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET - Get list of users current user has shared data with
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

    // Get sharing records with user details
    const { data: shares, error: sharesError } = await supabase
      .from("health_data_sharing")
      .select(
        `
        id,
        shared_to,
        created_at,
        profiles!health_data_sharing_shared_to_fkey1(
          id,
          email
        )
      `
      )
      .eq("user_id", user.id);

    if (sharesError) {
      console.error("Error fetching sharing permissions:", sharesError);
      return NextResponse.json(
        { error: "Failed to fetch sharing permissions" + sharesError.message },
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
        sharedTo: {
          id: profile?.id ?? share.shared_to,
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
