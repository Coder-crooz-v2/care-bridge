"use client";

import { useMemo } from "react";
import { VitalSigns, StatisticsData } from "../types";

export const useStatistics = (filteredData: VitalSigns[]): StatisticsData[] => {
  return useMemo(() => {
    if (filteredData.length === 0) return [];

    const latest = filteredData[filteredData.length - 1];

    return [
      {
        metric: "Heart Rate",
        current: Math.round(latest.heartRate),
        unit: "bpm",
        hourlyMax: Math.round(
          Math.max(...filteredData.map((d) => d.heartRate))
        ),
        hourlyMin: Math.round(
          Math.min(...filteredData.map((d) => d.heartRate))
        ),
        hourlyAvg: Math.round(
          filteredData.reduce((sum, d) => sum + d.heartRate, 0) /
            filteredData.length
        ),
        color: "text-red-500",
      },
      {
        metric: "SpO2",
        current: Math.round(latest.spo2 * 10) / 10,
        unit: "%",
        hourlyMax:
          Math.round(Math.max(...filteredData.map((d) => d.spo2)) * 10) / 10,
        hourlyMin:
          Math.round(Math.min(...filteredData.map((d) => d.spo2)) * 10) / 10,
        hourlyAvg:
          Math.round(
            (filteredData.reduce((sum, d) => sum + d.spo2, 0) /
              filteredData.length) *
              10
          ) / 10,
        color: "text-blue-500",
      },
      {
        metric: "Blood Pressure",
        current: Math.round(latest.systolic),
        unit: `/${Math.round(latest.diastolic)}`,
        hourlyMax: Math.round(Math.max(...filteredData.map((d) => d.systolic))),
        hourlyMin: Math.round(Math.min(...filteredData.map((d) => d.systolic))),
        hourlyAvg: Math.round(
          filteredData.reduce((sum, d) => sum + d.systolic, 0) /
            filteredData.length
        ),
        color: "text-emerald-500",
      },
      {
        metric: "Temperature",
        current: Math.round(latest.temperature * 10) / 10,
        unit: "°F",
        hourlyMax:
          Math.round(Math.max(...filteredData.map((d) => d.temperature)) * 10) /
          10,
        hourlyMin:
          Math.round(Math.min(...filteredData.map((d) => d.temperature)) * 10) /
          10,
        hourlyAvg:
          Math.round(
            (filteredData.reduce((sum, d) => sum + d.temperature, 0) /
              filteredData.length) *
              10
          ) / 10,
        color: "text-orange-500",
      },
    ];
  }, [filteredData]);
};
