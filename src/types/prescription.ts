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
  // New fields for enhanced medicine information
  purpose?: string; // Why this medicine is prescribed
  avoid_groups?: string[]; // Groups of people who should avoid this medicine
  interactions?: string[]; // Drug interactions
  precautions?: string[]; // Precautions to take
  contraindications?: string[]; // When not to use this medicine
}

export interface ReminderSettings {
  medicineId: string;
  medicineName: string;
  isActive: boolean;
  reminderDates: Date[];
  userEmail?: string;
  frequency: string;
  dosage: string;
  instructions: string;
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
  image_url?: string; // URL of the stored prescription image
}

export interface UploadResponse {
  success: boolean;
  data?: PrescriptionData;
  error?: string;
}
