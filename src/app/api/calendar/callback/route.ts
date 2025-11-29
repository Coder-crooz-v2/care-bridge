import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode } from "@/services/googleCalendarService";
import { updateUserCalendarTokens } from "@/controllers/googleCalendarController";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/calendar/callback?code=xxx
 * Handles OAuth callback and exchanges code for tokens
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Check for OAuth errors
    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/prescription-extractor?calendar_error=${error}`
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=unauthorized`
      );
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    // Save tokens to database
    const success = await updateUserCalendarTokens(user.id, tokens);

    if (!success) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/prescription-extractor?calendar_error=failed_to_save`
      );
    }

    // Redirect back to prescription extractor with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/prescription-extractor?calendar_connected=true`
    );
  } catch (error) {
    console.error("Error in calendar callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/prescription-extractor?calendar_error=callback_failed`
    );
  }
}
