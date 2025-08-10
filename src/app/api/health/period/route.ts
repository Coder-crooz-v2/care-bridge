import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET period history
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

    const { data: periods, error } = await supabase
      .from("period_tracking")
      .select("*")
      .eq("user_id", userId)
      .order("logged_date", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching period history:", error);
      return NextResponse.json(
        { error: "Failed to fetch period history" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: periods || [],
    });
  } catch (error) {
    console.error("Get period history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST new period entry
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
    const periodData = {
      user_id: user.id,
      cycle_day: body.cycle_day || 1,
      flow_intensity: body.flow_intensity,
      symptoms: body.symptoms || {},
      logged_date: body.logged_date || new Date().toISOString().split("T")[0],
    };

    const { data: period, error } = await supabase
      .from("period_tracking")
      .insert([periodData])
      .select()
      .single();

    if (error) {
      console.error("Error adding period entry:", error);
      return NextResponse.json(
        { error: "Failed to add period entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: period,
    });
  } catch (error) {
    console.error("Add period entry error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
