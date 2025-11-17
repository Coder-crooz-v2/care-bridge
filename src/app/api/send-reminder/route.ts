import { NextRequest, NextResponse } from "next/server";
import { sendReminderEmail } from "@/lib/resend-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userEmail,
      medicineName,
      dosage,
      instructions,
      notes,
      reminderTime,
    } = body;

    // Validate required fields
    if (!userEmail || !medicineName) {
      return NextResponse.json(
        { error: "Missing required fields: userEmail and medicineName" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Send the email using SendPulse
    await sendReminderEmail({
      userEmail,
      medicineName,
      dosage: dosage || "As prescribed",
      instructions: instructions || "Follow doctor's instructions",
      notes: notes || "",
      reminderTime,
    });

    return NextResponse.json({
      success: true,
      message: "Reminder email sent successfully",
    });
  } catch (error) {
    console.error("Send reminder error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send reminder email",
      },
      { status: 500 }
    );
  }
}
