import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("prescription") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG and JPG files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Create FormData to send to Python API
    const pythonFormData = new FormData();
    pythonFormData.append("image", file);

    // Get Python API URL from environment variables - force IPv4
    const pythonApiUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";

    // Call Python FastAPI backend
    const response = await fetch(`${pythonApiUrl}/dosage/extract-dosage`, {
      method: "POST",
      body: pythonFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Python API error:", errorText);
      throw new Error(`Python API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    // Transform the response to match our frontend interface
    const transformedData = {
      medicine_dosage_details:
        result.medicines || result.medicine_dosage_details || [],
      total_medicines:
        result.total_medicines ||
        (result.medicines ? result.medicines.length : 0),
      disclaimer:
        result.disclaimer ||
        "This prescription analysis is generated using AI and OCR technology. Please verify all medicine details with your healthcare provider before taking any medication. This tool is for informational purposes only and should not replace professional medical advice.",
      doctor_name: result.doctor_name,
      patient_name: result.patient_name,
      date_prescribed: result.date_prescribed,
      pharmacy_name: result.pharmacy_name,
      confidence_score: result.confidence_score,
      processing_time: result.processing_time,
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Prescription upload error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("fetch")
      ) {
        return NextResponse.json(
          {
            error:
              "Unable to connect to the prescription processing service. Please make sure the Python API server is running on the configured port.",
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
            : "Failed to process prescription",
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
