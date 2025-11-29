// Service: Google Calendar API Integration
import { google } from "googleapis";
import type {
  CalendarEvent,
  GoogleCalendarResponse,
  CalendarAuthTokens,
} from "@/models/googleCalendarModel";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

/**
 * Get OAuth2 client with user credentials
 */
export function getOAuth2Client(tokens: CalendarAuthTokens) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  });

  return oauth2Client;
}

/**
 * Generate Google OAuth authorization URL
 */
export function getAuthorizationUrl(): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(
  code: string
): Promise<CalendarAuthTokens> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  return {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token as string | undefined,
    expiry_date: tokens.expiry_date as number | undefined,
  };
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  tokens: CalendarAuthTokens,
  event: CalendarEvent
): Promise<GoogleCalendarResponse> {
  try {
    const oauth2Client = getOAuth2Client(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return {
      success: true,
      eventId: response.data.id as string | undefined,
    };
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event",
    };
  }
}

/**
 * Create multiple calendar events (batch operation)
 */
export async function createMultipleCalendarEvents(
  tokens: CalendarAuthTokens,
  events: CalendarEvent[]
): Promise<GoogleCalendarResponse> {
  try {
    const oauth2Client = getOAuth2Client(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const eventIds: string[] = [];

    // Create events sequentially (Google Calendar API doesn't support batch insert)
    for (const event of events) {
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      if (response.data.id) {
        eventIds.push(response.data.id);
      }
    }

    return {
      success: true,
      eventIds,
    };
  } catch (error) {
    console.error("Error creating multiple calendar events:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create events",
    };
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  tokens: CalendarAuthTokens,
  eventId: string
): Promise<GoogleCalendarResponse> {
  try {
    const oauth2Client = getOAuth2Client(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete event",
    };
  }
}

/**
 * Delete multiple calendar events
 */
export async function deleteMultipleCalendarEvents(
  tokens: CalendarAuthTokens,
  eventIds: string[]
): Promise<GoogleCalendarResponse> {
  try {
    const oauth2Client = getOAuth2Client(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Delete events sequentially
    for (const eventId of eventIds) {
      try {
        await calendar.events.delete({
          calendarId: "primary",
          eventId: eventId,
        });
      } catch (error) {
        console.error(`Error deleting event ${eventId}:`, error);
        // Continue with other deletions even if one fails
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting multiple calendar events:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete events",
    };
  }
}

/**
 * Update calendar event
 */
export async function updateCalendarEvent(
  tokens: CalendarAuthTokens,
  eventId: string,
  event: CalendarEvent
): Promise<GoogleCalendarResponse> {
  try {
    const oauth2Client = getOAuth2Client(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.update({
      calendarId: "primary",
      eventId: eventId,
      requestBody: event,
    });

    return {
      success: true,
      eventId: response.data.id as string | undefined,
    };
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update event",
    };
  }
}

/**
 * Refresh access token if expired
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<CalendarAuthTokens> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  return {
    access_token: credentials.access_token!,
    refresh_token: credentials.refresh_token || refreshToken,
    expiry_date: credentials.expiry_date as number | undefined,
  };
}
