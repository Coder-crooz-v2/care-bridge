"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, Circle, Droplets } from "lucide-react";
import { useAuthStore } from "@/store/useAuth";
import { HealthMonitoringService } from "@/lib/health-monitoring-service";
import { toast } from "sonner";

interface PeriodEntry {
  id?: string;
  user_id: string;
  logged_date: string;
  cycle_day?: number;
  flow_intensity: "light" | "moderate" | "heavy";
  symptoms: string[];
  notes?: string;
  created_at?: string;
}

interface PeriodStats {
  average_cycle_length: number;
  average_period_length: number;
  next_predicted_date: string;
  last_period_date: string;
}

const PeriodTracker: React.FC = () => {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [stats, setStats] = useState<PeriodStats | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);
  const [newPeriod, setNewPeriod] = useState<Partial<PeriodEntry>>({
    flow_intensity: "moderate",
    symptoms: [],
    notes: "",
  });

  const symptomOptions = [
    "cramps",
    "headache",
    "mood_swings",
    "bloating",
    "fatigue",
    "breast_tenderness",
    "acne",
    "back_pain",
    "nausea",
    "food_cravings",
  ];

  const flowColors = {
    light: "bg-accent/30 text-accent-foreground",
    moderate: "bg-accent/60 text-accent-foreground",
    heavy: "bg-accent text-accent-foreground",
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && mounted) {
      loadPeriodData();
    }
  }, [user, mounted]);

  const loadPeriodData = async () => {
    if (!user) return;

    try {
      const [periodsResponse, statsResponse] = await Promise.all([
        HealthMonitoringService.getPeriodHistory(user.id),
        HealthMonitoringService.getPeriodStats(user.id),
      ]);

      console.log("Periods response:", periodsResponse);
      console.log("Stats response:", statsResponse);

      if (periodsResponse.success && periodsResponse.data) {
        setPeriods(periodsResponse.data);
        console.log("Loaded periods:", periodsResponse.data);
      } else {
        console.error("Failed to load periods:", periodsResponse.error);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Failed to load period data:", error);
      toast.error("Failed to load period tracking data");
    }
  };

  const handleAddPeriod = async () => {
    if (!user || !selectedDate || !newPeriod.flow_intensity) {
      toast.error("Please fill in all required fields");
      return;
    }

    const periodEntry: PeriodEntry = {
      user_id: user.id,
      logged_date: selectedDate.toISOString().split("T")[0],
      cycle_day: 1, // Default cycle day, could be made configurable
      flow_intensity: newPeriod.flow_intensity,
      symptoms: newPeriod.symptoms || [],
      notes: newPeriod.notes,
    };

    try {
      const response = await HealthMonitoringService.addPeriodEntry(
        periodEntry
      );

      if (response.success) {
        // Check if this date already had an entry (existing data means it was updated)
        const existingEntry = periods.find(
          (p) => p.logged_date === selectedDate.toISOString().split("T")[0]
        );
        const message = existingEntry
          ? "Period entry updated successfully"
          : "Period entry added successfully";
        toast.success(message);
        setIsAddingPeriod(false);
        setNewPeriod({
          flow_intensity: "moderate",
          symptoms: [],
          notes: "",
        });
        loadPeriodData();
      } else {
        toast.error(response.error || "Failed to add period entry");
      }
    } catch (error) {
      toast.error("Failed to add period entry");
    }
  };

  const toggleSymptom = (symptom: string) => {
    setNewPeriod((prev) => ({
      ...prev,
      symptoms: prev.symptoms?.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...(prev.symptoms || []), symptom],
    }));
  };

  const getPeriodDates = () => {
    const dates = new Set<string>();
    console.log("Periods for calendar:", periods);
    periods.forEach((period) => {
      const start = new Date(period.logged_date);
      const dateString = start.toISOString().split("T")[0];
      console.log("Adding period date:", dateString, "from period:", period);
      dates.add(dateString);
    });
    console.log("Period dates set:", Array.from(dates));
    return dates;
  };

  const getDayClassName = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    const periodDates = getPeriodDates();

    if (periodDates.has(dateString)) {
      return "bg-accent text-accent-foreground hover:bg-accent/80";
    }

    // Predicted next period (if stats available)
    if (stats && stats.next_predicted_date) {
      const predictedDate = new Date(stats.next_predicted_date);
      const diffTime = Math.abs(date.getTime() - predictedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 2) {
        return "bg-accent/30 text-accent-foreground hover:bg-accent/40";
      }
    }

    return "";
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Please log in to access menstrual tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Circle className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Cycle Length</p>
                  <p className="text-2xl font-bold">
                    {stats.average_cycle_length}
                  </p>
                  <p className="text-xs text-muted-foreground">days avg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Droplets className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Cycle Length</p>
                  <p className="text-2xl font-bold">
                    {stats.average_period_length}
                  </p>
                  <p className="text-xs text-muted-foreground">days avg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Period</p>
                  <p className="text-lg font-bold">
                    {new Date(stats.last_period_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Next Predicted
                  </p>
                  <p className="text-lg font-bold">
                    {new Date(stats.next_predicted_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Menstrual Calendar</span>
              </CardTitle>
              <Dialog open={isAddingPeriod} onOpenChange={setIsAddingPeriod}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menstrual timeline
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Menstrual Entry</DialogTitle>
                    <DialogDescription>
                      Record your mentstruation details for this date
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedDate?.toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="flow">Flow Intensity</Label>
                      <Select
                        value={newPeriod.flow_intensity}
                        onValueChange={(
                          value: "light" | "moderate" | "heavy"
                        ) =>
                          setNewPeriod((prev) => ({
                            ...prev,
                            flow_intensity: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select flow intensity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="heavy">Heavy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Symptoms</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {symptomOptions.map((symptom) => (
                          <Button
                            key={symptom}
                            variant={
                              newPeriod.symptoms?.includes(symptom)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => toggleSymptom(symptom)}
                            className="justify-start"
                          >
                            {symptom.replace("_", " ")}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional notes..."
                        value={newPeriod.notes || ""}
                        onChange={(e) =>
                          setNewPeriod((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingPeriod(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddPeriod}>Add Period</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                period: (date) =>
                  getPeriodDates().has(date.toISOString().split("T")[0]),
              }}
              modifiersClassNames={{
                period: "bg-accent text-accent-foreground hover:bg-accent/80",
              }}
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-accent rounded" />
                <span className="text-sm">Period Days</span>
              </div>
              {stats && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-accent/30 rounded" />
                  <span className="text-sm">Predicted Next Period</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Period History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Periods</CardTitle>
          </CardHeader>
          <CardContent>
            {periods.length === 0 ? (
              <div className="text-center py-8">
                <Droplets className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No period data yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your periods to get insights and predictions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {periods.slice(0, 10).map((period, index) => (
                  <div
                    key={period.id || index}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {new Date(period.logged_date).toLocaleDateString()}
                        </p>
                        <Badge className={flowColors[period.flow_intensity]}>
                          {period.flow_intensity} flow
                        </Badge>
                      </div>
                    </div>

                    {period.symptoms.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Symptoms:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {period.symptoms.map((symptom) => (
                            <Badge
                              key={symptom}
                              variant="outline"
                              className="text-xs"
                            >
                              {symptom.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {period.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Notes:
                        </p>
                        <p className="text-sm">{period.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PeriodTracker;
