import axios from "axios";

/**
 * Client-side service for Google Calendar integration
 */

export interface CalendarStatus {
  success: boolean;
  connected: boolean;
  error?: string;
}

export interface CalendarAuthResponse {
  success: boolean;
  authUrl?: string;
  error?: string;
}

/**
 * Check if user has connected their Google Calendar
 */
export async function checkCalendarConnection(): Promise<CalendarStatus> {
  try {
    const response = await axios.get("/api/calendar/status");
    return {
      success: true,
      connected: response.data.connected,
    };
  } catch (error) {
    console.error("Error checking calendar connection:", error);
    return {
      success: false,
      connected: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check calendar connection",
    };
  }
}

/**
 * Get Google OAuth authorization URL
 */
export async function getCalendarAuthUrl(): Promise<CalendarAuthResponse> {
  try {
    const response = await axios.get("/api/calendar/auth");
    return {
      success: true,
      authUrl: response.data.authUrl,
    };
  } catch (error) {
    console.error("Error getting auth URL:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get authorization URL",
    };
  }
}

/**
 * Disconnect Google Calendar from user account
 */
export async function disconnectCalendar(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await axios.delete("/api/calendar/disconnect");
    return { success: true };
  } catch (error) {
    console.error("Error disconnecting calendar:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to disconnect calendar",
    };
  }
}

/**
 * Redirect user to Google OAuth consent screen
 */
export async function connectCalendar(): Promise<void> {
  const result = await getCalendarAuthUrl();
  if (result.success && result.authUrl) {
    window.location.href = result.authUrl;
  } else {
    throw new Error(result.error || "Failed to get authorization URL");
  }
}
