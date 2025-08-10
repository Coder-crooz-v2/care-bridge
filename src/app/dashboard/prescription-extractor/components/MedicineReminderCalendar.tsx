"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  Bell,
  BellOff,
  Clock,
  Mail,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { MedicineDetail, ReminderSettings } from "@/types/prescription";
import { PrescriptionHistoryService } from "@/lib/prescription-history-service";
import { toast } from "sonner";
import axios from "axios";

interface MedicineReminderCalendarProps {
  medicines: MedicineDetail[];
  prescriptionId?: string | null;
  userEmail?: string;
  initialReminders?: ReminderSettings[];
}

const MedicineReminderCalendar: React.FC<MedicineReminderCalendarProps> = ({
  medicines,
  prescriptionId,
  userEmail: initialUserEmail,
  initialReminders = [],
}) => {
  const [mounted, setMounted] = useState(false);
  const [reminders, setReminders] =
    useState<ReminderSettings[]>(initialReminders);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [userEmail, setUserEmail] = useState(initialUserEmail || "");
  const [isSettingReminder, setIsSettingReminder] = useState(false);

  // Handle hydration and initialize date
  React.useEffect(() => {
    setMounted(true);
    setSelectedDate(new Date());
  }, []);

  // Update reminders when initialReminders prop changes
  React.useEffect(() => {
    setReminders(initialReminders);
  }, [initialReminders]);

  // Generate reminder dates based on frequency and duration
  const generateReminderDates = useCallback(
    (medicine: MedicineDetail): Date[] => {
      if (!medicine.frequency || !medicine.duration) return [];

      const dates: Date[] = [];
      const today = new Date();

      // Parse frequency (e.g., "3 times daily", "twice daily", "once daily")
      const frequencyMatch = medicine.frequency
        .toLowerCase()
        .match(/(\d+|once|twice|thrice)\s*times?\s*(daily|day)/);
      let timesPerDay = 1;

      if (frequencyMatch) {
        const frequency = frequencyMatch[1];
        if (frequency === "once") timesPerDay = 1;
        else if (frequency === "twice") timesPerDay = 2;
        else if (frequency === "thrice") timesPerDay = 3;
        else timesPerDay = parseInt(frequency) || 1;
      }

      // Parse duration (e.g., "7 days", "2 weeks", "1 month")
      const durationMatch = medicine.duration
        .toLowerCase()
        .match(/(\d+)\s*(day|week|month)/);
      let totalDays = 7; // default

      if (durationMatch) {
        const amount = parseInt(durationMatch[1]);
        const unit = durationMatch[2];

        if (unit.startsWith("day")) totalDays = amount;
        else if (unit.startsWith("week")) totalDays = amount * 7;
        else if (unit.startsWith("month")) totalDays = amount * 30;
      }

      // Generate dates
      for (let day = 0; day < totalDays; day++) {
        const currentDate = addDays(today, day);
        for (let time = 0; time < timesPerDay; time++) {
          dates.push(currentDate);
        }
      }

      return dates;
    },
    []
  );

  // Save reminders to database if prescription exists
  const saveRemindersToDatabase = useCallback(
    async (updatedReminders: ReminderSettings[]) => {
      if (prescriptionId) {
        try {
          const response = await PrescriptionHistoryService.updatePrescription(
            prescriptionId,
            {
              reminder_dates: updatedReminders,
            }
          );

          if (response.success) {
            // Notify sidebar to refresh
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("prescription-updated"));
            }
          } else {
            console.error("Failed to save reminders:", response.error);
          }
        } catch (error) {
          console.error("Error saving reminders:", error);
        }
      }
    },
    [prescriptionId]
  );

  // Get all reminder dates for calendar highlighting
  const reminderDates = useMemo(() => {
    const dates = new Set<string>();
    reminders.forEach((reminder) => {
      reminder.reminderDates.forEach((date) => {
        dates.add(format(date, "yyyy-MM-dd"));
      });
    });
    return dates;
  }, [reminders]);

  // Set reminder for a medicine
  const setReminderForMedicine = useCallback(
    async (medicine: MedicineDetail) => {
      if (!userEmail) {
        toast.error("Please enter your email address first");
        return;
      }

      if (!medicine.name) {
        toast.error("Medicine name is required");
        return;
      }

      setIsSettingReminder(true);

      try {
        const reminderDates = generateReminderDates(medicine);

        if (reminderDates.length === 0) {
          toast.error(
            "Unable to generate reminder dates. Please check frequency and duration."
          );
          setIsSettingReminder(false);
          return;
        }

        // Create new reminder
        const newReminder: ReminderSettings = {
          medicineId: `${medicine.name}-${Math.random()
            .toString(36)
            .substring(2)}`,
          medicineName: medicine.name,
          isActive: true,
          reminderDates,
          userEmail,
          frequency: medicine.frequency,
          dosage: medicine.dosage,
          instructions: medicine.instructions,
        };

        // Send initial reminder email
        await axios.post("/api/send-reminder", {
          userEmail,
          medicineName: medicine.name,
          dosage: medicine.dosage,
          instructions: medicine.instructions,
          reminderTime: format(new Date(), "PPpp"),
        });

        setReminders((prev) => {
          const updatedReminders = [...prev, newReminder];
          // Save to database with the updated reminders
          saveRemindersToDatabase(updatedReminders);
          return updatedReminders;
        });
        toast.success(
          `Reminders set for ${medicine.name}! You'll receive ${reminderDates.length} email reminders.`
        );
      } catch (error) {
        console.error("Failed to set reminder:", error);
        toast.error("Failed to set reminder. Please try again.");
      } finally {
        setIsSettingReminder(false);
      }
    },
    [userEmail, generateReminderDates]
  );

  // Clear reminder for a medicine
  const clearReminderForMedicine = useCallback(
    (medicineId: string) => {
      const reminder = reminders.find((r) => r.medicineId === medicineId);
      if (reminder) {
        const updatedReminders = reminders.filter(
          (r) => r.medicineId !== medicineId
        );
        setReminders(updatedReminders);
        saveRemindersToDatabase(updatedReminders);
        toast.success(`Reminders cleared for ${reminder.medicineName}`);
      }
    },
    [reminders]
  );

  // Check if medicine has active reminder
  const hasActiveReminder = useCallback(
    (medicineName: string) => {
      return reminders.some(
        (r) => r.medicineName === medicineName && r.isActive
      );
    },
    [reminders]
  );

  // Get reminder for medicine
  const getReminderForMedicine = useCallback(
    (medicineName: string) => {
      return reminders.find((r) => r.medicineName === medicineName);
    },
    [reminders]
  );

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted/20 border-dashed">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Loading calendar...</p>
        </div>
      </Card>
    );
  }

  if (!medicines || medicines.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted/20 border-dashed">
        <div className="text-center p-8">
          <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-lg">
            No medicines to schedule
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Process a prescription to set reminders
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 h-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Medicine Reminder Calendar
          </CardTitle>
          <div className="flex items-center gap-4">
            <Input
              type="email"
              placeholder="Enter your email for reminders"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span>Reminder dates</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              reminder: (date) => reminderDates.has(format(date, "yyyy-MM-dd")),
            }}
            modifiersStyles={{
              reminder: {
                backgroundColor: "#3b82f6",
                color: "white",
                borderRadius: "50%",
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Medicine List with Reminder Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Medicine Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {medicines.map((medicine, index) => {
              const medicineReminder = getReminderForMedicine(medicine.name);
              const hasReminder = hasActiveReminder(medicine.name);

              return (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{medicine.name}</h4>
                        {hasReminder && (
                          <Badge variant="default" className="text-xs">
                            <Bell className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <strong>Dosage:</strong> {medicine.dosage}
                        </p>
                        <p>
                          <strong>Frequency:</strong> {medicine.frequency}
                        </p>
                        <p>
                          <strong>Duration:</strong> {medicine.duration}
                        </p>
                      </div>

                      {medicineReminder && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
                            <Mail className="h-4 w-4" />
                            <span>Email reminders active</span>
                          </div>
                          <p className="text-xs text-blue-600">
                            {medicineReminder.reminderDates.length} reminders
                            scheduled
                          </p>
                          <p className="text-xs text-blue-600">
                            Sending to: {medicineReminder.userEmail}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {hasReminder ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            clearReminderForMedicine(
                              medicineReminder!.medicineId
                            )
                          }
                          className="flex items-center gap-2"
                        >
                          <BellOff className="h-4 w-4" />
                          Clear Reminder
                        </Button>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex items-center gap-2"
                              disabled={
                                !userEmail ||
                                !medicine.frequency ||
                                !medicine.duration
                              }
                            >
                              <Bell className="h-4 w-4" />
                              Set Reminder
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Set Reminder for {medicine.name}
                              </DialogTitle>
                              <DialogDescription>
                                This will create email reminders based on your
                                prescription schedule.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                <p>
                                  <strong>Medicine:</strong> {medicine.name}
                                </p>
                                <p>
                                  <strong>Dosage:</strong> {medicine.dosage}
                                </p>
                                <p>
                                  <strong>Frequency:</strong>{" "}
                                  {medicine.frequency}
                                </p>
                                <p>
                                  <strong>Duration:</strong> {medicine.duration}
                                </p>
                                <p>
                                  <strong>Instructions:</strong>{" "}
                                  {medicine.instructions}
                                </p>
                              </div>

                              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-blue-700">
                                      Reminder Schedule Preview
                                    </p>
                                    <p className="text-sm text-blue-600 mt-1">
                                      Based on your prescription, you'll receive
                                      approximately{" "}
                                      <strong>
                                        {generateReminderDates(medicine).length}
                                      </strong>{" "}
                                      email reminders over the treatment period.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-2">
                                <DialogTrigger asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogTrigger>
                                <Button
                                  onClick={() =>
                                    setReminderForMedicine(medicine)
                                  }
                                  disabled={isSettingReminder}
                                  className="flex items-center gap-2"
                                >
                                  {isSettingReminder ? (
                                    <>
                                      <Clock className="h-4 w-4 animate-spin" />
                                      Setting...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4" />
                                      Confirm Reminder
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {medicines.length > 0 &&
            medicines.some((m) => !m.frequency || !m.duration) && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-700">
                      Incomplete Information
                    </p>
                    <p className="text-sm text-yellow-600 mt-1">
                      Some medicines are missing frequency or duration
                      information. Please edit these details to enable
                      reminders.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineReminderCalendar;
