import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, medicineName, dosage, instructions, reminderTime } =
      body;

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

    const pythonApiUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";

    // Call Python FastAPI backend for email sending
    const response = await fetch(`${pythonApiUrl}/reminder/send-reminder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_email: userEmail,
        medicine_name: medicineName,
        dosage: dosage || "As prescribed",
        instructions: instructions || "Follow doctor's instructions",
        reminder_time: reminderTime,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Python API error:", errorText);

      // If Python API is not available, provide a helpful error
      if (response.status === 404 || response.status === 503) {
        return NextResponse.json(
          {
            error:
              "Email service temporarily unavailable. Please ensure the Python API server is running.",
            details:
              "The reminder system requires the Python backend to be active.",
          },
          { status: 503 }
        );
      }

      throw new Error(`Python API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Reminder email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Send reminder error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("fetch")
      ) {
        return NextResponse.json(
          {
            error:
              "Unable to connect to the email service. Please make sure the Python API server is running.",
            details:
              "The email reminder feature requires the Python backend to be active on the configured port.",
          },
          { status: 503 }
        );
      }
    }

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
