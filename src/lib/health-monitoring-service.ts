import { createClient } from "@/utils/supabase/client";
import {
  HealthData,
  SharedUser,
  ShareHealthRequest,
  AttendedRequest,
  HealthAlert,
  UserHealthProfile,
  VitalSigns,
  PeriodEntry,
  PeriodStats,
} from "@/types/health";

const supabase = createClient();

export class HealthMonitoringService {
  private static ws: WebSocket | null = null;
  private static messageHandlers: Map<string, (data: any) => void> = new Map();

  /**
   * Connect to WebSocket for real-time health data
   */
  static async connectWebSocket(
    userId: string,
    userEmail: string,
    isFemale: boolean = false
  ): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `ws://localhost:8000/ws/${userId}?is_female=${isFemale}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("Connected to health monitoring WebSocket");

          // Register user email
          this.ws?.send(
            JSON.stringify({
              type: "register_email",
              email: userEmail,
            })
          );

          resolve(this.ws!);
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const handler = this.messageHandlers.get(message.type);
            if (handler) {
              handler(message.data);
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onclose = () => {
          console.log("Health monitoring WebSocket connection closed");
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  static disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  /**
   * Add message handler for WebSocket messages
   */
  static addMessageHandler(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Remove message handler
   */
  static removeMessageHandler(type: string) {
    this.messageHandlers.delete(type);
  }

  /**
   * Share health data with another user
   */
  static async shareHealthData(request: ShareHealthRequest): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch("/api/health/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetEmail: request.targetEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || "Failed to share health data",
        };
      }

      const result = await response.json();
      return { success: result.success, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get list of users who have shared their data with current user
   */
  static async getSharedUsers(userId: string): Promise<{
    success: boolean;
    data?: SharedUser[];
    error?: string;
  }> {
    try {
      const response = await fetch("/api/health/shared-data");

      if (!response.ok) {
        throw new Error("Failed to fetch shared users");
      }

      const result = await response.json();
      return { success: true, data: result.shared_users };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get list of users with whom you are sharing your data
   */
  static async getSharingList(): Promise<{
    success: boolean;
    data?: Array<{ id: string; viewer_email: string; created_at: string }>;
    error?: string;
  }> {
    try {
      const response = await fetch("/api/health/share");

      if (!response.ok) {
        throw new Error("Failed to fetch sharing list");
      }

      const result = await response.json();
      return { success: true, data: result.sharingList };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Stop sharing health data with a user
   */
  static async stopSharing(targetEmail: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch("/api/health/share", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || "Failed to stop sharing",
        };
      }

      const result = await response.json();
      return { success: result.success, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Save health data snapshot
   */
  static async saveHealthData(
    vitals: any,
    analysis?: any
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch("/api/health/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vitals, analysis }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || "Failed to save health data",
        };
      }

      const result = await response.json();
      return { success: result.success, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Mark a user as attended to stop SOS alerts
   */
  static async markAttended(request: AttendedRequest): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(
        "http://localhost:8000/api/health/mark_attended",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark as attended");
      }

      const result = await response.json();

      // Update in Supabase as well
      const { error: dbError } = await supabase
        .from("health_alerts")
        .update({
          status: "attended",
          attended_by: request.attended_by,
          attended_at: new Date().toISOString(),
        })
        .eq("user_id", request.user_id)
        .eq("status", "active");

      if (dbError) {
        console.error("Error updating alert status in database:", dbError);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get user's health profile
   */
  static async getHealthProfile(userId: string): Promise<{
    success: boolean;
    data?: UserHealthProfile;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("user_health_profile")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update user's health profile
   */
  static async updateHealthProfile(profile: UserHealthProfile): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase.from("user_health_profile").upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get health alerts for a user
   */
  static async getHealthAlerts(userId: string): Promise<{
    success: boolean;
    data?: HealthAlert[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("health_alerts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get health sharing permissions for a user
   */
  static async getHealthSharingPermissions(userId: string): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("health_sharing")
        .select(
          `
          *,
          sharer_profile:sharer_user_id(email),
          viewer_profile:viewer_user_id(email)
        `
        )
        .or(`sharer_user_id.eq.${userId},viewer_user_id.eq.${userId}`)
        .eq("is_active", true);

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Store hourly health data summary (called by background job)
   */
  static async storeHourlyHealthData(
    userId: string,
    vitalsHistory: VitalSigns[],
    hourStart: string,
    hourEnd: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!vitalsHistory.length) {
      return { success: true };
    }

    try {
      // Calculate statistics
      const heartRates = vitalsHistory.map((v) => v.heart_rate);
      const spo2Values = vitalsHistory.map((v) => v.spo2);
      const bpSysValues = vitalsHistory.map((v) => v.blood_pressure_systolic);
      const bpDiaValues = vitalsHistory.map((v) => v.blood_pressure_diastolic);
      const tempValues = vitalsHistory.map((v) => v.temperature);

      const normalReadings = vitalsHistory.filter(
        (v) =>
          v.heart_rate >= 60 &&
          v.heart_rate <= 100 &&
          v.spo2 >= 95 &&
          v.blood_pressure_systolic >= 90 &&
          v.blood_pressure_systolic <= 140 &&
          v.blood_pressure_diastolic >= 60 &&
          v.blood_pressure_diastolic <= 90 &&
          v.temperature >= 97.0 &&
          v.temperature <= 99.0
      ).length;

      const { error } = await supabase.from("health_vitals_hourly").upsert({
        user_id: userId,
        avg_heart_rate: heartRates.reduce((a, b) => a + b) / heartRates.length,
        min_heart_rate: Math.min(...heartRates),
        max_heart_rate: Math.max(...heartRates),
        avg_spo2: spo2Values.reduce((a, b) => a + b) / spo2Values.length,
        min_spo2: Math.min(...spo2Values),
        max_spo2: Math.max(...spo2Values),
        avg_bp_systolic:
          bpSysValues.reduce((a, b) => a + b) / bpSysValues.length,
        min_bp_systolic: Math.min(...bpSysValues),
        max_bp_systolic: Math.max(...bpSysValues),
        avg_bp_diastolic:
          bpDiaValues.reduce((a, b) => a + b) / bpDiaValues.length,
        min_bp_diastolic: Math.min(...bpDiaValues),
        max_bp_diastolic: Math.max(...bpDiaValues),
        avg_temperature: tempValues.reduce((a, b) => a + b) / tempValues.length,
        min_temperature: Math.min(...tempValues),
        max_temperature: Math.max(...tempValues),
        normal_readings: normalReadings,
        attention_readings: vitalsHistory.length - normalReadings,
        hour_start: hourStart,
        hour_end: hourEnd,
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get period history for a user
   */
  static async getPeriodHistory(userId: string): Promise<{
    success: boolean;
    data?: PeriodEntry[];
    error?: string;
  }> {
    try {
      const response = await fetch(`/api/health/period?user_id=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch period history");
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get period statistics for a user
   */
  static async getPeriodStats(userId: string): Promise<{
    success: boolean;
    data?: PeriodStats;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `/api/health/period/stats?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch period stats");
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Add a new period entry
   */
  static async addPeriodEntry(entry: PeriodEntry): Promise<{
    success: boolean;
    data?: PeriodEntry;
    error?: string;
  }> {
    try {
      const response = await fetch("/api/health/period", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error("Failed to add period entry");
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
