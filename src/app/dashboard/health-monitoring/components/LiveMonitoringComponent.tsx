"use client";

import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Import custom hooks and components
import { useSocketConnection } from "../hooks/useSocketConnection";
import { useChartConfig } from "../hooks/useChartConfig";
import { useStatistics } from "../hooks/useStatistics";
import { filterDataByTimeRange } from "../utils/dataHelpers";
import { TimeRangeFilter } from "./TimeRangeFilter";
import { CurrentValues } from "./CurrentValues";
import { VitalChart } from "./VitalChart";
import { StatisticsTable } from "./StatisticsTable";
import { TimeRange } from "../types";

const LiveMonitoringComponent = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("60");

  // Use custom hooks for socket connection and data
  const { vitalData, isConnected } = useSocketConnection();

  // Filter data based on selected time range
  const filteredData = filterDataByTimeRange(vitalData, timeRange);

  // Get chart configurations
  const {
    chartOptions,
    heartRateData,
    spo2Data,
    bloodPressureData,
    temperatureData,
  } = useChartConfig(filteredData);

  // Calculate statistics
  const statistics = useStatistics(filteredData);

  return (
    <div className="space-y-6 mt-4">
      {/* Time Range Filter and Connection Status */}
      <TimeRangeFilter
        timeRange={timeRange}
        onTimeRangeChange={(value) => setTimeRange(value)}
        isConnected={isConnected}
      />

      {/* Current Values Display */}
      <CurrentValues statistics={statistics} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VitalChart
          title="Heart Rate"
          description="Real-time heart rate monitoring (bpm)"
          data={heartRateData}
          options={chartOptions}
          color="bg-red-500"
        />

        <VitalChart
          title="Oxygen Saturation (SpO2)"
          description="Blood oxygen saturation levels (%)"
          data={spo2Data}
          options={chartOptions}
          color="bg-blue-500"
        />

        <VitalChart
          title="Blood Pressure"
          description="Systolic and diastolic pressure (mmHg)"
          data={bloodPressureData}
          options={chartOptions}
          color="bg-emerald-500"
        />

        <VitalChart
          title="Body Temperature"
          description="Core body temperature (°F)"
          data={temperatureData}
          options={chartOptions}
          color="bg-orange-500"
        />
      </div>

      {/* Hourly Statistics */}
      <StatisticsTable statistics={statistics} filteredData={filteredData} />
    </div>
  );
};

export default LiveMonitoringComponent;
