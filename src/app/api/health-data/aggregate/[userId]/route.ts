import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify sharing permission still exists
    const { data: sharingPermission, error: permissionError } = await supabase
      .from("health_data_sharing")
      .select("id")
      .eq("user_id", userId)
      .eq("shared_to", user.id)
      .single();

    if (permissionError || !sharingPermission) {
      return NextResponse.json(
        { error: "No permission to view this user's data" },
        { status: 403 }
      );
    }

    // Fetch aggregated health data from the past hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("health_data")
      .select(
        "heart_rate, spo2, blood_pressure_systolic, blood_pressure_diastolic, temperature"
      )
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch health data" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          heartRate: { avg: 0, min: 0, max: 0 },
          spo2: { avg: 0, min: 0, max: 0 },
          systolic: { avg: 0, min: 0, max: 0 },
          diastolic: { avg: 0, min: 0, max: 0 },
          temperature: { avg: 0, min: 0, max: 0 },
          recordCount: 0,
        },
      });
    }

    // Calculate aggregates
    const heartRates = data.map((d) => d.heart_rate).filter((v) => v != null);
    const spo2Values = data.map((d) => d.spo2).filter((v) => v != null);
    const systolicValues = data
      .map((d) => d.blood_pressure_systolic)
      .filter((v) => v != null);
    const diastolicValues = data
      .map((d) => d.blood_pressure_diastolic)
      .filter((v) => v != null);
    const tempValues = data.map((d) => d.temperature).filter((v) => v != null);

    const aggregate = (values: number[]) => {
      if (values.length === 0) return { avg: 0, min: 0, max: 0 };
      return {
        avg:
          Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) /
          10,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    };

    return NextResponse.json({
      success: true,
      data: {
        heartRate: aggregate(heartRates),
        spo2: aggregate(spo2Values),
        systolic: aggregate(systolicValues),
        diastolic: aggregate(diastolicValues),
        temperature: aggregate(tempValues),
        recordCount: data.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
