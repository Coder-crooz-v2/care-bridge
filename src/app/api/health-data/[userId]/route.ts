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

    // Fetch health data for the user from the past hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("health_data")
      .select(
        "id, heart_rate, spo2, blood_pressure_systolic, blood_pressure_diastolic, temperature, created_at"
      )
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch health data" },
        { status: 500 }
      );
    }

    // Transform data to match VitalSigns interface
    const transformedData = (data || []).map((record) => ({
      timestamp: record.created_at,
      heartRate: record.heart_rate || 0,
      spo2: record.spo2 || 0,
      systolic: record.blood_pressure_systolic || 0,
      diastolic: record.blood_pressure_diastolic || 0,
      temperature: record.temperature || 0,
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      count: transformedData.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
