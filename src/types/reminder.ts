export interface Reminder {
  id: string;
  medicine_id: string;
  user_id: string;
  scheduled_time: string; // Time of day (morning, noon, night)
  scheduled_hour: number; // 9, 12, or 20
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderWithDetails extends Reminder {
  medicine_name: string;
  dosage: string | null;
  instructions: string | null;
  notes: string | null;
  user_email: string;
}
