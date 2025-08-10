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

    const { targetEmail } = await request.json();

    if (!targetEmail || targetEmail === user.email) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Simple: Just create or update the sharing relationship
    const { error } = await supabase.from("health_sharing").upsert({
      sharer_email: user.email,
      viewer_email: targetEmail,
      sharer_user_id: user.id,
      is_active: true,
    });

    if (error) {
      console.error("Sharing error:", error);
      return NextResponse.json({ error: "Failed to share" }, { status: 500 });
    }

    return NextResponse.json({ message: "Sharing enabled", success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: sharingList } = await supabase
      .from("health_sharing")
      .select("id, viewer_email, created_at")
      .eq("sharer_email", user.email)
      .eq("is_active", true);

    return NextResponse.json({ sharingList: sharingList || [], success: true });
  } catch (error) {
    console.error("Get sharing error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetEmail } = await request.json();

    const { error } = await supabase
      .from("health_sharing")
      .update({ is_active: false })
      .eq("sharer_email", user.email)
      .eq("viewer_email", targetEmail);

    if (error) {
      console.error("Stop sharing error:", error);
      return NextResponse.json(
        { error: "Failed to stop sharing" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Sharing stopped", success: true });
  } catch (error) {
    console.error("Delete sharing error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
