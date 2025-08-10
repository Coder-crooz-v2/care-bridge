import { createClient } from "@/utils/supabase/client";

const supabase = createClient();
import { MedicineDetail } from "@/types/prescription";

export interface PrescriptionHistory {
  id: string;
  title: string;
  image_url?: string;
  medicines: MedicineDetail[];
  extracted_data?: any;
  reminder_dates?: any;
  created_at: string;
  updated_at: string;
}

export class PrescriptionHistoryService {
  static async savePrescription({
    title,
    imageUrl,
    medicines,
    extractedData,
    reminderDates,
  }: {
    title: string;
    imageUrl?: string;
    medicines: MedicineDetail[];
    extractedData?: any;
    reminderDates?: any;
  }): Promise<{
    success: boolean;
    data?: PrescriptionHistory;
    error?: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      const { data, error } = await supabase
        .from("prescription_history")
        .insert({
          user_id: user.id,
          title,
          image_url: imageUrl,
          medicines: medicines as any,
          extracted_data: extractedData,
          reminder_dates: reminderDates,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error saving prescription:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save prescription",
      };
    }
  }

  static async getPrescriptionHistory(): Promise<{
    success: boolean;
    data?: PrescriptionHistory[];
    error?: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      const { data, error } = await supabase
        .from("prescription_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error fetching prescription history:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch prescription history",
      };
    }
  }

  static async deletePrescription(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      const { error } = await supabase
        .from("prescription_history")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting prescription:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete prescription",
      };
    }
  }

  static async updatePrescription(
    id: string,
    updates: Partial<
      Pick<
        PrescriptionHistory,
        "title" | "medicines" | "reminder_dates" | "extracted_data"
      >
    >
  ): Promise<{ success: boolean; data?: PrescriptionHistory; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      const { data, error } = await supabase
        .from("prescription_history")
        .update({
          ...updates,
          medicines: updates.medicines as any,
          extracted_data: updates.extracted_data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error updating prescription:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update prescription",
      };
    }
  }
}
