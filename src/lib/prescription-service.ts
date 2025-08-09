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
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      return {
        success: true,
        data: data as PrescriptionData,
      };
    } catch (error) {
      console.error("Error uploading prescription:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Mock function for demo purposes - remove this when you have a real API
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
          notes: "Dosage details not clearly readable from prescription",
        },
        {
          name: "Ibuprofen",
          dosage: "400mg",
          frequency: "2 times daily",
          duration: "3 days",
          instructions: "take with food",
          notes: "Monitor for any gastrointestinal discomfort",
        },
        {
          name: "Amoxicillin",
          dosage: "500mg",
          frequency: "2 times daily",
          duration: "7 days",
          instructions: "take on empty stomach",
        },
        {
          name: "Vitamin D3",
          dosage: "60000 IU",
          frequency: "once weekly",
          duration: "8 weeks",
          instructions: "take with milk or after meals",
        },
      ],
      total_medicines: 4,
      disclaimer:
        "This prescription analysis is generated using AI and OCR technology. Please verify all medicine details with your healthcare provider before taking any medication. This tool is for informational purposes only and should not replace professional medical advice.",
    };

    return {
      success: true,
      data: mockData,
    };
  }
}
