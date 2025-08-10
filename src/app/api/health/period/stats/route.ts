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
    const userId = url.searchParams.get("user_id") || user.id;

    // Get period history to calculate stats
    const { data: periods, error } = await supabase
      .from("period_tracking")
      .select("logged_date, cycle_day, flow_intensity")
      .eq("user_id", userId)
      .order("logged_date", { ascending: false })
      .limit(30); // Last 30 entries for better calculation

    if (error) {
      console.error("Error fetching periods for stats:", error);
      return NextResponse.json(
        { error: "Failed to fetch period statistics" },
        { status: 500 }
      );
    }

    if (!periods || periods.length < 5) {
      return NextResponse.json({
        success: true,
        data: null, // Not enough data for statistics
      });
    }

    // Group entries by cycle (assuming cycle starts at cycle_day 1)
    const cycles: { start: Date; entries: any[] }[] = [];
    let currentCycle: { start: Date; entries: any[] } | null = null;

    periods.reverse(); // Process in chronological order

    for (const period of periods) {
      if (period.cycle_day === 1 || !currentCycle) {
        if (currentCycle) {
          cycles.push(currentCycle);
        }
        currentCycle = {
          start: new Date(period.logged_date),
          entries: [period],
        };
      } else {
        currentCycle.entries.push(period);
      }
    }

    if (currentCycle) {
      cycles.push(currentCycle);
    }

    if (cycles.length < 2) {
      return NextResponse.json({
        success: true,
        data: null, // Not enough complete cycles for statistics
      });
    }

    // Calculate cycle lengths
    const cycleLengths: number[] = [];
    const periodLengths: number[] = [];

    for (let i = 1; i < cycles.length; i++) {
      const currentStart = cycles[i].start;
      const previousStart = cycles[i - 1].start;
      const cycleLength = Math.round(
        (currentStart.getTime() - previousStart.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (cycleLength > 20 && cycleLength < 40) {
        // Reasonable cycle length
        cycleLengths.push(cycleLength);
      }
    }

    // Calculate period lengths (consecutive days with flow)
    cycles.forEach((cycle) => {
      const flowDays = cycle.entries.filter(
        (entry) =>
          entry.flow_intensity &&
          ["light", "moderate", "heavy"].includes(entry.flow_intensity)
      ).length;
      if (flowDays > 0) {
        periodLengths.push(flowDays);
      }
    });

    // Calculate averages
    const avgCycleLength =
      cycleLengths.length > 0
        ? Math.round(
            cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
          )
        : 28;

    const avgPeriodLength =
      periodLengths.length > 0
        ? Math.round(
            periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
          )
        : 5;

    // Predict next period
    const lastPeriodDate = new Date(cycles[cycles.length - 1].start);
    const nextPredictedDate = new Date(lastPeriodDate);
    nextPredictedDate.setDate(nextPredictedDate.getDate() + avgCycleLength);

    const stats = {
      average_cycle_length: avgCycleLength,
      average_period_length: avgPeriodLength,
      last_period_date: cycles[cycles.length - 1].start
        .toISOString()
        .split("T")[0],
      next_predicted_date: nextPredictedDate.toISOString().split("T")[0],
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get period stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
