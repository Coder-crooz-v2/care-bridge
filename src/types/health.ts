export interface VitalSigns {
  heart_rate: number;
  spo2: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  temperature: number;
  timestamp: string;
}

export interface PeriodData {
  cycle_day?: number;
  flow_intensity?: "light" | "moderate" | "heavy";
  symptoms?: string[];
  timestamp: string;
}

export interface HealthMetrics {
  heart_rate: {
    avg: number;
    min: number;
    max: number;
  };
  spo2: {
    avg: number;
    min: number;
    max: number;
  };
  blood_pressure: {
    systolic: {
      avg: number;
      min: number;
      max: number;
    };
    diastolic: {
      avg: number;
      min: number;
      max: number;
    };
  };
  temperature: {
    avg: number;
    min: number;
    max: number;
  };
}

export interface HealthAnalysis {
  status: "normal" | "needs_attention" | "unknown";
  metrics: HealthMetrics;
  concerns: string[];
  recommendations: string[];
}

export interface HealthData {
  user_id: string;
  vitals: VitalSigns;
  period_data?: PeriodData;
  analysis: HealthAnalysis;
  needs_attention: boolean;
  is_attended: boolean;
}

export interface SharedUser {
  user_id: string;
  user_email: string;
  user_name?: string;
  latest_data?: HealthData;
  needs_attention: boolean;
  is_attended: boolean;
}

export interface ShareHealthRequest {
  sharer_email: string;
  targetEmail: string;
  user_id: string;
}

export interface AttendedRequest {
  user_id: string;
  attended_by: string;
}

export interface HealthAlert {
  id: string;
  user_id: string;
  alert_type: string;
  vitals_data: VitalSigns;
  status: "active" | "attended" | "resolved";
  attended_by?: string;
  attended_at?: string;
  created_at: string;
  resolved_at?: string;
}

export interface UserHealthProfile {
  user_id: string;
  is_female: boolean;
  emergency_contacts?: string[];
  medical_conditions?: string[];
  medications?: string[];
  notification_preferences: {
    email_alerts: boolean;
    sms_alerts: boolean;
    push_notifications: boolean;
  };
}

export interface HealthSharingPermission {
  id: string;
  sharer_user_id: string;
  viewer_user_id: string;
  sharer_email: string;
  viewer_email: string;
  created_at: string;
  is_active: boolean;
}

export interface PeriodEntry {
  id?: string;
  user_id: string;
  start_date: string;
  end_date?: string;
  flow_intensity: "light" | "moderate" | "heavy";
  symptoms: string[];
  notes?: string;
  created_at?: string;
}

export interface PeriodStats {
  average_cycle_length: number;
  average_period_length: number;
  next_predicted_date: string;
  last_period_date: string;
}
