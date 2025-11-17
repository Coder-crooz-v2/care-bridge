export interface PrescriptionList {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Medicine {
  id: string;
  user_id: string;
  prescription_id: string;
  medicine: string;
  dosage: string | null;
  duration: number;
  morning: boolean;
  noon: boolean;
  night: boolean;
  notes: string | null;
  instructions: string | null;
  created_at: string;
  updated_at: string;
}
