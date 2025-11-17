import axios from "axios";

export interface ReminderSchedule {
  medicine_id: string;
  user_id: string;
  duration: number;
  morning: boolean;
  noon: boolean;
  night: boolean;
}

export interface ScheduleReminderResponse {
  success: boolean;
  message: string;
  reminders_created?: number;
}

export const scheduleReminder = async (
  schedule: ReminderSchedule
): Promise<ScheduleReminderResponse> => {
  try {
    const response = await axios.post<ScheduleReminderResponse>(
      "/api/reminders/schedule",
      schedule
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to schedule reminder"
      );
    }
    throw error;
  }
};

export const cancelReminder = async (
  medicineId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(`/api/reminders/cancel`, {
      params: { medicine_id: medicineId },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to cancel reminder"
      );
    }
    throw error;
  }
};

export const checkReminderStatus = async (
  medicineId: string
): Promise<{ hasActiveReminder: boolean }> => {
  try {
    const response = await axios.get(`/api/reminders/status`, {
      params: { medicine_id: medicineId },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error || "Failed to check reminder status"
      );
    }
    throw error;
  }
};
