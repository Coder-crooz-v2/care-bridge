"use client";

import React from "react";

interface VitalsData {
  timestamp: string;
  heart_rate: number;
  spo2: number;
  temperature: number;
  blood_pressure: string;
}

interface VitalsChartProps {
  data: VitalsData[];
}

const VitalsChart: React.FC<VitalsChartProps> = ({ data }) => {
  const maxHeartRate = Math.max(...data.map((d) => d.heart_rate));
  const minHeartRate = Math.min(...data.map((d) => d.heart_rate));
  const normalizeHeartRate = (value: number) => {
    const range = maxHeartRate - minHeartRate;
    return range > 0 ? ((value - minHeartRate) / range) * 100 : 50;
  };

  const maxSpo2 = Math.max(...data.map((d) => d.spo2));
  const minSpo2 = Math.min(...data.map((d) => d.spo2));
  const normalizeSpo2 = (value: number) => {
    const range = maxSpo2 - minSpo2;
    return range > 0 ? ((value - minSpo2) / range) * 100 : 50;
  };

  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-muted-foreground">
        No chart data available
      </div>
    );
  }

  const chartWidth = 800;
  const chartHeight = 200;
  const padding = 40;
  const stepX = (chartWidth - 2 * padding) / Math.max(data.length - 1, 1);

  // Generate heart rate path
  const heartRatePath = data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y =
        chartHeight -
        padding -
        (normalizeHeartRate(d.heart_rate) / 100) * (chartHeight - 2 * padding);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Generate SpO2 path
  const spo2Path = data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y =
        chartHeight -
        padding -
        (normalizeSpo2(d.spo2) / 100) * (chartHeight - 2 * padding);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="w-full">
      {/* Chart Legend */}
      <div className="flex items-center space-x-6 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-destructive"></div>
          <span className="text-sm text-muted-foreground">Heart Rate</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-primary"></div>
          <span className="text-sm text-muted-foreground">SpO2</span>
        </div>
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-64 border rounded"
      >
        {/* Grid lines */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 20"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Heart Rate Line */}
        <path
          d={heartRatePath}
          stroke="#ef4444"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* SpO2 Line */}
        <path
          d={spo2Path}
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = padding + i * stepX;
          const heartRateY =
            chartHeight -
            padding -
            (normalizeHeartRate(d.heart_rate) / 100) *
              (chartHeight - 2 * padding);
          const spo2Y =
            chartHeight -
            padding -
            (normalizeSpo2(d.spo2) / 100) * (chartHeight - 2 * padding);

          return (
            <g key={i}>
              {/* Heart rate point */}
              <circle
                cx={x}
                cy={heartRateY}
                r="3"
                fill="#ef4444"
                className="hover:r-5 transition-all cursor-pointer"
              >
                <title>{`${new Date(d.timestamp).toLocaleTimeString()}: ${
                  d.heart_rate
                } bpm`}</title>
              </circle>

              {/* SpO2 point */}
              <circle
                cx={x}
                cy={spo2Y}
                r="3"
                fill="#3b82f6"
                className="hover:r-5 transition-all cursor-pointer"
              >
                <title>{`${new Date(d.timestamp).toLocaleTimeString()}: ${
                  d.spo2
                }%`}</title>
              </circle>
            </g>
          );
        })}

        {/* X-axis labels (time) */}
        {data.map((d, i) => {
          if (i % Math.ceil(data.length / 6) === 0) {
            // Show every 6th label
            const x = padding + i * stepX;
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
              >
                {new Date(d.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </text>
            );
          }
          return null;
        })}

        {/* Y-axis labels */}
        <text x="10" y="20" fontSize="10" fill="#64748b">
          High
        </text>
        <text x="10" y={chartHeight - 50} fontSize="10" fill="#64748b">
          Low
        </text>
      </svg>

      {/* Current Values Display */}
      {data.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Latest Heart Rate:</span>
            <span className="font-medium">
              {data[data.length - 1].heart_rate} bpm
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Latest SpO2:</span>
            <span className="font-medium">{data[data.length - 1].spo2}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Latest Temperature:</span>
            <span className="font-medium">
              {data[data.length - 1].temperature}°F
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Latest Blood Pressure:
            </span>
            <span className="font-medium">
              {data[data.length - 1].blood_pressure}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsChart;
