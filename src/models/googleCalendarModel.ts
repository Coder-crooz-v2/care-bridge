// Model: Google Calendar Event Data Structure
export interface CalendarEvent {
  id?: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders: {
    useDefault: boolean;
    overrides?: {
      method: string;
      minutes: number;
    }[];
  };
  recurrence?: string[];
}

export interface MedicineReminderEvent {
  medicineId: string;
  userId: string;
  medicineName: string;
  dosage: string;
  instructions: string;
  duration: number;
  morning: boolean;
  noon: boolean;
  night: boolean;
  timeSlot?: "morning" | "noon" | "night";
  startDate?: Date;
}

export interface GoogleCalendarResponse {
  success: boolean;
  eventId?: string;
  eventIds?: string[];
  error?: string;
}

export interface CalendarAuthTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

// Helper function to create event from medicine reminder
export function createCalendarEventFromReminder(
  reminder: MedicineReminderEvent
): CalendarEvent {
  // Map time slots to hours
  const timeSlotHours: Record<string, number> = {
    morning: 9,
    noon: 12,
    night: 20,
  };

  const hour = timeSlotHours[reminder.timeSlot || "morning"];
  const startDate = reminder.startDate || new Date();

  const startDateTime = new Date(startDate);
  startDateTime.setHours(hour, 0, 0, 0);

  const endDateTime = new Date(startDateTime);
  endDateTime.setMinutes(endDateTime.getMinutes() + 15); // 15-minute event

  // Create recurrence rule (daily for the duration)
  const recurrenceRule = `RRULE:FREQ=DAILY;COUNT=${reminder.duration}`;

  const timeSlotLabel =
    reminder.timeSlot?.charAt(0).toUpperCase() || "M" + reminder.timeSlot?.slice(1) || "orning";

  return {
    summary: `Medicine: ${reminder.medicineName} (${timeSlotLabel})`,
    description: `
Medicine: ${reminder.medicineName}
Dosage: ${reminder.dosage}
Time: ${timeSlotLabel}
${reminder.instructions ? `Instructions: ${reminder.instructions}` : ""}

This is an automated reminder from CareBridge. Please take your medicine as prescribed.
    `.trim(),
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 30 },
        { method: "popup", minutes: 15 },
      ],
    },
    recurrence: [recurrenceRule],
  };
}
