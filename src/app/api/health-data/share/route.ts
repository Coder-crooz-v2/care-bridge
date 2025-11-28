import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST - Share health data with another user
export async function POST(request: NextRequest) {
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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user with this email exists
    const { data: targetUser, error: userError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 404 }
      );
    }

    // Prevent sharing with self
    if (targetUser.id === user.id) {
      return NextResponse.json(
        { error: "Cannot share data with yourself" },
        { status: 400 }
      );
    }

    // Check if sharing already exists
    const { data: existingShare } = await supabase
      .from("health_data_sharing")
      .select("id")
      .eq("user_id", user.id)
      .eq("shared_to", targetUser.id)
      .single();

    if (existingShare) {
      return NextResponse.json(
        { error: "Already sharing data with this user" },
        { status: 409 }
      );
    }

    // Create sharing record
    const { data: sharing, error: sharingError } = await supabase
      .from("health_data_sharing")
      .insert({
        user_id: user.id,
        shared_to: targetUser.id,
      })
      .select()
      .single();

    if (sharingError) {
      return NextResponse.json(
        { error: "Failed to create sharing permission" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: sharing.id,
        sharedTo: {
          id: targetUser.id,
          email: targetUser.email,
        },
        createdAt: sharing.created_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Revoke sharing permission
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const sharedToId = searchParams.get("sharedToId");

    if (!sharedToId) {
      return NextResponse.json(
        { error: "sharedToId is required" },
        { status: 400 }
      );
    }

    // Delete sharing record
    const { error: deleteError } = await supabase
      .from("health_data_sharing")
      .delete()
      .eq("user_id", user.id)
      .eq("shared_to", sharedToId);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to revoke sharing permission" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sharing permission revoked",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
