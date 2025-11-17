import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

const CalendarSection = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-lg border w-full [--cell-size:calc(100%/7-2px)] sm:[--cell-size:calc(100%/7-4px)] md:[--cell-size:calc(100%/7-6px)] lg:[--cell-size:calc(100%/7-8px)]"
        />
      </CardContent>
    </Card>
  );
};

export default CalendarSection;
