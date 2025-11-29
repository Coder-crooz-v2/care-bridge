// Controller: Business Logic for Google Calendar Integration
import { createClient } from "@/utils/supabase/server";
import type {
  MedicineReminderEvent,
  GoogleCalendarResponse,
  CalendarAuthTokens,
} from "@/models/googleCalendarModel";
import { createCalendarEventFromReminder } from "@/models/googleCalendarModel";
import {
  createMultipleCalendarEvents,
  deleteMultipleCalendarEvents,
  refreshAccessToken,
} from "@/services/googleCalendarService";

/**
 * Get user's Google Calendar tokens from database
 */
export async function getUserCalendarTokens(
  userId: string
): Promise<CalendarAuthTokens | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_calendar_tokens")
    .select("access_token, refresh_token, expiry_date")
    .eq("user_id", userId)
    .eq("provider", "google")
    .single();

  if (error || !data) {
    console.log("No Google Calendar tokens found for user:", userId);
    return null;
  }

  // Convert expiry_date to timestamp for comparison
  const expiryTimestamp =
    typeof data.expiry_date === "string"
      ? new Date(data.expiry_date).getTime()
      : data.expiry_date;

  // Check if token is expired and refresh if needed
  if (expiryTimestamp && Date.now() >= expiryTimestamp) {
    if (data.refresh_token) {
      try {
        const newTokens = await refreshAccessToken(data.refresh_token);
        await updateUserCalendarTokens(userId, newTokens);
        return newTokens;
      } catch (error) {
        console.error("Error refreshing token:", error);
        return null;
      }
    }
    return null;
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: expiryTimestamp,
  };
}

/**
 * Save or update user's Google Calendar tokens
 */
export async function updateUserCalendarTokens(
  userId: string,
  tokens: CalendarAuthTokens
): Promise<boolean> {
  const supabase = await createClient();

  // Convert expiry_date from milliseconds to ISO string if needed
  let expiryDate: string;
  if (typeof tokens.expiry_date === "number") {
    expiryDate = new Date(tokens.expiry_date).toISOString();
  } else if (typeof tokens.expiry_date === "string") {
    expiryDate = tokens.expiry_date;
  } else {
    expiryDate = new Date(Date.now() + 3600000).toISOString(); // Default: 1 hour from now
  }

  const { error } = await supabase.from("user_calendar_tokens").upsert({
    user_id: userId,
    provider: "google",
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: expiryDate,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error updating calendar tokens:", error);
    return false;
  }

  return true;
}

/**
 * Create Google Calendar events for medicine reminders
 */
export async function createMedicineCalendarEvents(
  reminder: MedicineReminderEvent
): Promise<GoogleCalendarResponse & { eventsCreated?: number }> {
  try {
    // Get user's calendar tokens
    const tokens = await getUserCalendarTokens(reminder.userId);

    if (!tokens) {
      return {
        success: false,
        error:
          "Google Calendar not connected. Please connect your calendar first.",
      };
    }

    // Create calendar events from reminder
    const events: any[] = [];
    const startDate = new Date();

    // Create events for each selected time slot
    if (reminder.morning) {
      events.push(
        createCalendarEventFromReminder({
          ...reminder,
          timeSlot: "morning",
          startDate,
        })
      );
    }
    if (reminder.noon) {
      events.push(
        createCalendarEventFromReminder({
          ...reminder,
          timeSlot: "noon",
          startDate,
        })
      );
    }
    if (reminder.night) {
      events.push(
        createCalendarEventFromReminder({
          ...reminder,
          timeSlot: "night",
          startDate,
        })
      );
    }

    // Create events in Google Calendar
    const result = await createMultipleCalendarEvents(tokens, events);

    if (!result.success) {
      return result;
    }

    // Store event IDs in database for later deletion
    if (result.eventIds && result.eventIds.length > 0) {
      await storeCalendarEventIds(
        reminder.medicineId,
        reminder.userId,
        result.eventIds
      );
    }

    return {
      ...result,
      eventsCreated: result.eventIds?.length || 0,
    };
  } catch (error) {
    console.error("Error in createMedicineCalendarEvents:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create calendar events",
    };
  }
}

/**
 * Delete Google Calendar events for a medicine
 */
export async function deleteMedicineCalendarEvents(
  medicineId: string,
  userId: string
): Promise<GoogleCalendarResponse> {
  try {
    // Get user's calendar tokens
    const tokens = await getUserCalendarTokens(userId);

    if (!tokens) {
      // If no tokens, just return success (user may not have connected calendar)
      return { success: true };
    }

    // Get stored event IDs from database
    const eventIds = await getCalendarEventIds(medicineId, userId);

    if (eventIds.length === 0) {
      return { success: true };
    }

    // Delete events from Google Calendar
    const result = await deleteMultipleCalendarEvents(tokens, eventIds);

    // Remove event IDs from database
    await removeCalendarEventIds(medicineId, userId);

    return result;
  } catch (error) {
    console.error("Error in deleteMedicineCalendarEvents:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete calendar events",
    };
  }
}

/**
 * Store calendar event IDs in database
 */
async function storeCalendarEventIds(
  medicineId: string,
  userId: string,
  eventIds: string[]
): Promise<void> {
  const supabase = await createClient();

  await supabase.from("medicine_calendar_events").insert({
    medicine_id: medicineId,
    user_id: userId,
    event_ids: eventIds,
    created_at: new Date().toISOString(),
  });
}

/**
 * Get calendar event IDs from database
 */
async function getCalendarEventIds(
  medicineId: string,
  userId: string
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("medicine_calendar_events")
    .select("event_ids")
    .eq("medicine_id", medicineId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return [];
  }

  return data.event_ids || [];
}

/**
 * Remove calendar event IDs from database
 */
async function removeCalendarEventIds(
  medicineId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("medicine_calendar_events")
    .delete()
    .eq("medicine_id", medicineId)
    .eq("user_id", userId);
}

/**
 * Check if user has connected Google Calendar
 */
export async function isCalendarConnected(userId: string): Promise<boolean> {
  const tokens = await getUserCalendarTokens(userId);
  return tokens !== null;
}
