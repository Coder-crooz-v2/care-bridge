import { UploadResponse, PrescriptionData } from "@/types/prescription";

export class PrescriptionService {
  static async uploadPrescription(file: File): Promise<UploadResponse> {
    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append("prescription", file);

      // Make API call to upload and process prescription
      const response = await fetch("/api/prescription-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        // If it's a connection error to Python API, fall back to mock
        if (
          response.status === 503 ||
          (errorData?.error && errorData.error.includes("unable to connect"))
        ) {
          console.warn("Python API unavailable, falling back to mock service");
          return this.mockUploadPrescription(file);
        }

        throw new Error(
          errorData?.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      return {
        success: true,
        data: data as PrescriptionData,
      };
    } catch (error) {
      console.error("Error uploading prescription:", error);

      // If network error or connection refused, try mock service
      if (
        error instanceof Error &&
        (error.message.includes("fetch") ||
          error.message.includes("NetworkError"))
      ) {
        console.warn("Network error detected, falling back to mock service");
        return this.mockUploadPrescription(file);
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Mock function for demo purposes when Python API is unavailable
  static async mockUploadPrescription(file: File): Promise<UploadResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock response data
    const mockData: PrescriptionData = {
      medicine_dosage_details: [
        {
          name: "Paracetamol",
          dosage: "625mg",
          frequency: "3 times daily",
          duration: "5 days",
          instructions: "take after meals",
          notes: "Mock data - Python API not available",
          confidence: 0.85,
          category: "painkiller",
          generic_name: "Acetaminophen",
        },
        {
          name: "Ibuprofen",
          dosage: "400mg",
          frequency: "2 times daily",
          duration: "3 days",
          instructions: "take with food",
          notes: "Monitor for any gastrointestinal discomfort",
          confidence: 0.92,
          category: "anti-inflammatory",
          side_effects: ["nausea", "stomach upset"],
          warnings: ["Do not exceed recommended dose"],
        },
      ],
      total_medicines: 2,
      disclaimer:
        "⚠️ DEMO MODE: This is mock data because the Python ML API is not available. Please start the Python server for real prescription processing.",
      doctor_name: "Dr. Demo",
      confidence_score: 0.88,
      processing_time: 3000,
    };

    return {
      success: true,
      data: mockData,
    };
  }
}
