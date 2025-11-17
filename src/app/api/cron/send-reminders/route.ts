import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendReminderEmail } from "@/lib/resend-service";

// This endpoint should be called by a cron job every hour
// You can use Vercel Cron Jobs or an external service like cron-job.org
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron job (optional but recommended for security)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get current date and time
    const now = new Date();
    const currentHour = now.getHours();
    const currentDate = now.toISOString().split("T")[0]; // YYYY-MM-DD

    // Determine which time slot we're in (morning: 9, noon: 12, night: 20)
    let scheduledHour: number | null = null;
    if (currentHour === 9) {
      scheduledHour = 9; // Morning
    } else if (currentHour === 12) {
      scheduledHour = 12; // Noon
    } else if (currentHour === 20) {
      scheduledHour = 20; // Night
    }

    // If not a scheduled hour, return early
    if (scheduledHour === null) {
      return NextResponse.json({
        message: "Not a scheduled reminder time",
        currentHour,
      });
    }

    // Fetch active reminders that should be sent at this hour with medicine details
    const { data: reminders, error } = await supabase
      .from("medicine_reminders")
      .select(
        `
        *,
        medicine_details!inner (
          medicine,
          dosage,
          instructions,
          notes,
          user_id
        )
      `
      )
      .eq("is_active", true)
      .eq("scheduled_hour", scheduledHour)
      .lte("start_date", now.toISOString())
      .gte("end_date", now.toISOString());

    if (error) {
      console.error("Error fetching reminders:", error);
      return NextResponse.json(
        { error: "Failed to fetch reminders" },
        { status: 500 }
      );
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({
        message: "No reminders to send at this time",
        scheduledHour,
      });
    }

    // Send emails for each reminder
    const emailPromises = reminders.map(async (reminder: any) => {
      try {
        // Fetch user email from auth.users
        const { data: userData } = await supabase
          .from("auth.users")
          .select("email")
          .eq("id", reminder.user_id)
          .single();

        if (!userData?.email) {
          console.error(`User email not found for reminder ${reminder.id}`);
          return {
            success: false,
            reminder_id: reminder.id,
            error: "No email",
          };
        }

        await sendReminderEmail({
          userEmail: userData.email,
          medicineName: reminder.medicine_details.medicine,
          dosage: reminder.medicine_details.dosage || "As prescribed",
          instructions:
            reminder.medicine_details.instructions ||
            "Follow doctor's instructions",
          notes: reminder.medicine_details.notes || "",
          reminderTime: reminder.scheduled_time,
        });

        // Log successful send
        console.log(
          `Email sent to ${userData.email} for ${reminder.medicine_details.medicine} at ${reminder.scheduled_time}`
        );

        return { success: true, reminder_id: reminder.id };
      } catch (error) {
        console.error(
          `Failed to send email for reminder ${reminder.id}:`,
          error
        );
        return { success: false, reminder_id: reminder.id, error };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: "Cron job executed successfully",
      scheduledHour,
      totalReminders: reminders.length,
      emailsSent: successCount,
      emailsFailed: failureCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to execute cron job",
      },
      { status: 500 }
    );
  }
}
