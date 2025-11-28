import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { Medicine } from "@/types/prescription";

interface CalendarSectionProps {
  selectedMedicine?: Medicine | null;
}

const CalendarSection = ({ selectedMedicine }: CalendarSectionProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);

  useEffect(() => {
    if (selectedMedicine) {
      // Calculate reminder dates based on duration
      const dates: Date[] = [];
      const today = new Date();
      const duration = selectedMedicine.duration || 1;

      for (let i = 0; i < duration; i++) {
        const reminderDate = new Date(today);
        reminderDate.setDate(today.getDate() + i);
        dates.push(reminderDate);
      }

      setHighlightedDates(dates);
    } else {
      setHighlightedDates([]);
    }
  }, [selectedMedicine]);

  return (
    <Card className="h-fit p-0 bg-transparent border-0 shadow-none">
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-lg border w-full [--cell-size:calc(100%/7-2px)] sm:[--cell-size:calc(100%/7-4px)] md:[--cell-size:calc(100%/7-6px)] lg:[--cell-size:calc(100%/7-8px)]"
          modifiers={{
            highlighted: highlightedDates,
          }}
          modifiersStyles={{
            highlighted: {
              backgroundColor: "rgb(59 130 246)",
              color: "white",
              fontWeight: "bold",
            },
          }}
        />
        {selectedMedicine && (
          <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
            <p className="font-medium">
              Reminder Schedule for {selectedMedicine.medicine}:
            </p>
            <ul className="mt-1 space-y-1 flex flex-wrap gap-2 sm:gap-3">
              {selectedMedicine.morning && (
                <li className="text-xs sm:text-sm">9:00 AM</li>
              )}
              {selectedMedicine.noon && (
                <li className="text-xs sm:text-sm">12:00 PM</li>
              )}
              {selectedMedicine.night && (
                <li className="text-xs sm:text-sm">8:00 PM</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarSection;
