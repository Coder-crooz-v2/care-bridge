import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("prescription") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
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

    // Upload image to Supabase Storage using server-side client
    let imageUrl: string | undefined = undefined;

    try {
      // Generate a unique filename
      const fileExtension = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExtension}`;

      console.log(
        `Attempting to upload file: ${fileName} to bucket: prescription-images`
      );

      // Upload to Supabase Storage using server-side client
      const { data, error } = await supabase.storage
        .from("prescription-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase storage error:", error);
        console.error("Error details:", {
          message: error.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          statusCode: (error as any).statusCode,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          error: (error as any).error,
        });

        // Storage failed - don't set imageUrl
        console.warn("Image upload failed - no image will be stored.");
      } else {
        console.log("Upload successful:", data);

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("prescription-images").getPublicUrl(fileName);

        console.log("Generated public URL:", publicUrl);
        imageUrl = publicUrl;
      }
    } catch (uploadError) {
      console.warn("Image upload failed:", uploadError);
      console.warn("Proceeding without storing image.");
      // imageUrl remains undefined
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
      image_url: imageUrl, // Include the stored image URL (if successful)
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
