"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Activity,
  Droplet,
  Heart,
  Thermometer,
} from "lucide-react";

interface AggregateData {
  avg: number;
  min: number;
  max: number;
}

interface HealthAggregates {
  heartRate: AggregateData;
  spo2: AggregateData;
  systolic: AggregateData;
  diastolic: AggregateData;
  temperature: AggregateData;
  recordCount: number;
}

interface SharedUserCardProps {
  userId: string;
  email: string;
  sharedAt: string;
}

export default function SharedUserCard({
  userId,
  email,
  sharedAt,
}: SharedUserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aggregateData, setAggregateData] = useState<HealthAggregates | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAggregateData();
  }, [userId]);

  async function fetchAggregateData() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/health-data/aggregate/${userId}`);

      if (!response.ok) {
        if (response.status === 403) {
          setError("Permission revoked");
          return;
        }
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();

      if (result.success) {
        setAggregateData(result.data);
      }
    } catch (err) {
      setError("Failed to load health data");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{email}</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!aggregateData) return null;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg md:text-xl">
              {email}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Shared on {new Date(sharedAt).toLocaleDateString()} •{" "}
              {aggregateData.recordCount} records
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 sm:p-6">
        {/* Average Values (Always Visible) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <div className="flex items-center space-x-1 sm:space-x-2 p-2 sm:p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Heart Rate</p>
              <p className="text-sm sm:text-base md:text-lg font-semibold">
                {aggregateData.heartRate.avg} bpm
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 p-2 sm:p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <Droplet className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Avg SpO2</p>
              <p className="text-sm sm:text-base md:text-lg font-semibold">
                {aggregateData.spo2.avg}%
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Avg BP</p>
              <p className="text-sm sm:text-base md:text-lg font-semibold">
                {aggregateData.systolic.avg}/{aggregateData.diastolic.avg}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 p-2 sm:p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <Thermometer className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Temp</p>
              <p className="text-sm sm:text-base md:text-lg font-semibold">
                {aggregateData.temperature.avg}°F
              </p>
            </div>
          </div>
        </div>

        {/* Expanded View - Min/Max Values */}
        {isExpanded && (
          <div className="mt-4 space-y-3 pt-3 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              {/* Heart Rate Min/Max */}
              <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                    Heart Rate
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-1">
                  <span className="text-muted-foreground">
                    Min:{" "}
                    <span className="font-medium text-foreground">
                      {aggregateData.heartRate.min} bpm
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Max:{" "}
                    <span className="font-medium text-foreground">
                      {aggregateData.heartRate.max} bpm
                    </span>
                  </span>
                </div>
              </div>

              {/* SpO2 Min/Max */}
              <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Droplet className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                    SpO2
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-1">
                  <span className="text-muted-foreground">
                    Min:{" "}
                    <span className="font-medium text-foreground">
                      {aggregateData.spo2.min}%
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Max:{" "}
                    <span className="font-medium text-foreground">
                      {aggregateData.spo2.max}%
                    </span>
                  </span>
                </div>
              </div>

              {/* Blood Pressure Min/Max */}
              <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    Blood Pressure (Systolic)
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-1">
                  <span className="text-muted-foreground">
                    Min:{" "}
                    <span className="font-medium text-foreground">
                      {aggregateData.systolic.min} mmHg
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Max:{" "}
                    <span className="font-medium text-foreground">
                      {aggregateData.systolic.max} mmHg
                    </span>
                  </span>
                </div>
              </div>

              {/* Temperature Min/Max */}
              <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Thermometer className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                    Temperature
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-1">
                  <span className="text-muted-foreground">
                    Min:{" "}
                    <span className="font-medium text-foreground">
                      {aggregateData.temperature.min}°F
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Max:{" "}
                    <span className="font-medium text-foreground">
                      {aggregateData.temperature.max}°F
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
