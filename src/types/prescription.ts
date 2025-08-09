export interface MedicineDetail {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  notes?: string;
}

export interface PrescriptionData {
  medicine_dosage_details: MedicineDetail[];
  total_medicines: number;
  disclaimer: string;
}

export interface UploadResponse {
  success: boolean;
  data?: PrescriptionData;
  error?: string;
}
