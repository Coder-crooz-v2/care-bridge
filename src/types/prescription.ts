export interface MedicineDetail {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  notes?: string;
  confidence?: number; // OCR confidence level
  brand_name?: string; // Brand name if different from generic
  generic_name?: string; // Generic name
  category?: string; // Medicine category (antibiotic, painkiller, etc.)
  side_effects?: string[]; // Common side effects
  warnings?: string[]; // Important warnings
}

export interface PrescriptionData {
  medicine_dosage_details: MedicineDetail[];
  total_medicines: number;
  disclaimer: string;
  doctor_name?: string; // Doctor's name from prescription
  patient_name?: string; // Patient name if extracted
  date_prescribed?: string; // Prescription date
  pharmacy_name?: string; // Pharmacy name if mentioned
  confidence_score?: number; // Overall extraction confidence
  processing_time?: number; // Time taken to process
}

export interface UploadResponse {
  success: boolean;
  data?: PrescriptionData;
  error?: string;
}
