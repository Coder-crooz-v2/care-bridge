import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendReminderEmail } from "@/lib/resend-service";
import {
  createMedicineCalendarEvents,
  isCalendarConnected,
} from "@/controllers/googleCalendarController";

// Helper function to calculate scheduled times
function getScheduledTimes(
  morning: boolean,
  noon: boolean,
  night: boolean
): { time: string; hour: number }[] {
  const times: { time: string; hour: number }[] = [];

  if (morning) times.push({ time: "morning", hour: 9 });
  if (noon) times.push({ time: "noon", hour: 12 });
  if (night) times.push({ time: "night", hour: 20 });

  return times;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { medicine_id, user_id, duration, morning, noon, night } = body;

    // Validate required fields
    if (!medicine_id || !user_id || !duration) {
      return NextResponse.json(
        {
          error: "Missing required fields: medicine_id, user_id, duration",
        },
        { status: 400 }
      );
    }

    // Check if at least one time slot is selected
    if (!morning && !noon && !night) {
      return NextResponse.json(
        {
          error:
            "At least one time slot (morning, noon, or night) must be selected",
        },
        { status: 400 }
      );
    }

    // Fetch medicine details from database
    const { data: medicine, error: medicineError } = await supabase
      .from("medicine_details")
      .select("medicine, dosage, instructions, notes, user_id")
      .eq("id", medicine_id)
      .single();

    if (medicineError || !medicine) {
      console.error("Error fetching medicine:", medicineError);
      return NextResponse.json(
        { error: "Medicine not found" },
        { status: 404 }
      );
    }

    // Fetch user email from auth.users
    const { data: userData, error: userError } = await supabase
      .from("auth.users")
      .select("email")
      .eq("id", user_id)
      .single();

    // If direct query fails, try getting from current user
    let userEmail = userData?.email;
    if (userError || !userEmail) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userEmail = user?.email;
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 404 }
      );
    }

    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(duration.toString()));

    // Get scheduled times
    const scheduledTimes = getScheduledTimes(morning, noon, night);

    // First, deactivate any existing reminders for this medicine
    await supabase
      .from("medicine_reminders")
      .update({ is_active: false })
      .eq("medicine_id", medicine_id);

    // Create reminder entries for each time slot
    const reminderPromises = scheduledTimes.map(({ time, hour }) =>
      supabase.from("medicine_reminders").insert({
        medicine_id,
        user_id,
        scheduled_time: time,
        scheduled_hour: hour,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_active: true,
      })
    );

    const results = await Promise.all(reminderPromises);

    // Check for errors
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      console.error("Error creating reminders:", errors);
      return NextResponse.json(
        { error: "Failed to create some reminders" },
        { status: 500 }
      );
    }

    // Optional: Send a confirmation email immediately
    try {
      await sendReminderEmail({
        userEmail,
        medicineName: medicine.medicine,
        dosage: medicine.dosage || "As prescribed",
        instructions: medicine.instructions || "Follow doctor's instructions",
        notes: medicine.notes || "",
        reminderTime: scheduledTimes[0].time,
      });
      console.log("Confirmation email sent successfully");
    } catch (emailError) {
      // Don't fail the whole request if confirmation email fails
      console.error("Failed to send confirmation email:", emailError);
    }

    // Optional: Create Google Calendar events if connected
    try {
      const calendarConnected = await isCalendarConnected(user_id);
      if (calendarConnected) {
        const calendarResult = await createMedicineCalendarEvents({
          medicineId: medicine_id,
          userId: user_id,
          medicineName: medicine.medicine,
          dosage: medicine.dosage || "As prescribed",
          instructions: medicine.instructions || "Follow doctor's instructions",
          duration: parseInt(duration.toString()),
          morning,
          noon,
          night,
        });

        if (!calendarResult.success) {
          console.error(
            "Failed to create calendar events:",
            calendarResult.error
          );
        } else {
          console.log(
            `Created ${calendarResult.eventsCreated} Google Calendar events`
          );
        }
      }
    } catch (calendarError) {
      // Don't fail the whole request if calendar creation fails
      console.error("Failed to create calendar events:", calendarError);
    }

    return NextResponse.json({
      success: true,
      message: `Reminder scheduled successfully for ${duration} days. You will receive emails at ${scheduledTimes
        .map((t) => t.time)
        .join(", ")} daily.`,
      reminders_created: scheduledTimes.length,
      scheduled_times: scheduledTimes,
    });
  } catch (error) {
    console.error("Schedule reminder error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to schedule reminder",
      },
      { status: 500 }
    );
  }
}
