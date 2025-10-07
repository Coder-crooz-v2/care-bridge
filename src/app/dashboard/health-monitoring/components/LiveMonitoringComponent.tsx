"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Line } from "react-chartjs-2";
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
import { io, Socket } from "socket.io-client";

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

interface VitalSigns {
  timestamp: string;
  heartRate: number;
  spo2: number;
  systolic: number;
  diastolic: number;
  temperature: number;
}

interface StatisticsData {
  metric: string;
  current: number;
  unit: string;
  hourlyMax: number;
  hourlyMin: number;
  hourlyAvg: number;
  color: string;
}

type TimeRange = "10" | "30" | "60";

const LiveMonitoringComponent = () => {
  const [vitalData, setVitalData] = useState<VitalSigns[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRange, setTimeRange] = useState<TimeRange>("60");
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Helper function to filter data based on time range
  const filterDataByTimeRange = (data: VitalSigns[]) => {
    const now = Date.now();
    const rangeInMs = parseInt(timeRange) * 60 * 1000;
    return data.filter((d) => {
      const timestamp = new Date(d.timestamp).getTime();
      return now - timestamp <= rangeInMs;
    });
  };

  // Helper function to create gradient background
  const createGradient = (
    ctx: CanvasRenderingContext2D,
    colorStart: string,
    colorEnd: string
  ) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  };

  useEffect(() => {
    // Initialize Socket.IO connection
    const initializeSocket = async () => {
      // First, initialize the server endpoint
      await fetch("/api/health/health-monitoring");

      // Connect to Socket.IO server
      const socket = io({
        path: "/api/health/health-monitoring/socket",
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from Socket.IO server");
        setIsConnected(false);
      });

      socket.on("vital-signs", (data: VitalSigns) => {
        setVitalData((prevData) => {
          const newData = [...prevData, data];
          // Keep data within the maximum time range (1 hour)
          const now = Date.now();
          const filtered = newData.filter((d) => {
            const timestamp = new Date(d.timestamp).getTime();
            return now - timestamp <= 60 * 60 * 1000; // 1 hour
          });
          return filtered;
        });
      });
    };

    initializeSocket();

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(timeInterval);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Get filtered data based on selected time range
  const filteredData = filterDataByTimeRange(vitalData);

  // Chart options for area charts
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 6,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
      },
      filler: {
        propagate: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
          color: "rgba(107, 114, 128, 0.8)",
        },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(107, 114, 128, 0.1)",
        },
        ticks: {
          color: "rgba(107, 114, 128, 0.8)",
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  // Prepare chart data
  const labels = filteredData.map((d) =>
    new Date(d.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const heartRateData = {
    labels,
    datasets: [
      {
        label: "Heart Rate (bpm)",
        data: filteredData.map((d) => Math.round(d.heartRate)),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          return createGradient(
            ctx,
            "rgba(239, 68, 68, 0.4)",
            "rgba(239, 68, 68, 0.05)"
          );
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(239, 68, 68)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
      },
    ],
  };

  const spo2Data = {
    labels,
    datasets: [
      {
        label: "SpO2 (%)",
        data: filteredData.map((d) => Math.round(d.spo2 * 10) / 10),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          return createGradient(
            ctx,
            "rgba(59, 130, 246, 0.4)",
            "rgba(59, 130, 246, 0.05)"
          );
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
      },
    ],
  };

  const bloodPressureData = {
    labels,
    datasets: [
      {
        label: "Systolic",
        data: filteredData.map((d) => Math.round(d.systolic)),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          return createGradient(
            ctx,
            "rgba(16, 185, 129, 0.4)",
            "rgba(16, 185, 129, 0.05)"
          );
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(16, 185, 129)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
      },
      {
        label: "Diastolic",
        data: filteredData.map((d) => Math.round(d.diastolic)),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          return createGradient(
            ctx,
            "rgba(34, 197, 94, 0.3)",
            "rgba(34, 197, 94, 0.05)"
          );
        },
        borderWidth: 2,
        fill: "+1",
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
      },
    ],
  };

  const temperatureData = {
    labels,
    datasets: [
      {
        label: "Temperature (°F)",
        data: filteredData.map((d) => Math.round(d.temperature * 10) / 10),
        borderColor: "rgb(245, 101, 101)",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          return createGradient(
            ctx,
            "rgba(245, 101, 101, 0.4)",
            "rgba(245, 101, 101, 0.05)"
          );
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(245, 101, 101)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
      },
    ],
  };

  // Calculate statistics
  const calculateStats = (): StatisticsData[] => {
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
  };

  const statistics = calculateStats();

  return (
    <div className="space-y-6 mt-4">
      {/* Time Range Filter and Connection Status */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <label htmlFor="timeRange" className="text-sm font-medium">
            Time Range:
          </label>
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Last 10 minutes</SelectItem>
              <SelectItem value="30">Last 30 minutes</SelectItem>
              <SelectItem value="60">Last 1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Current Values Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statistics.map((stat) => (
          <Card key={stat.metric} className="text-center">
            <CardContent className="">
              <div className={`text-5xl font-bold ${stat.color} mb-1`}>
                {stat.current}
                <span className="text-lg font-normal ml-1">{stat.unit}</span>
              </div>
              <div className={`text-lg font-bold ${stat.color}`}>
                {stat.metric}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heart Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Heart Rate
            </CardTitle>
            <CardDescription>
              Real-time heart rate monitoring (bpm)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={heartRateData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* SpO2 Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Oxygen Saturation (SpO2)
            </CardTitle>
            <CardDescription>
              Blood oxygen saturation levels (%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={spo2Data} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Blood Pressure Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              Blood Pressure
            </CardTitle>
            <CardDescription>
              Systolic and diastolic pressure (mmHg)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={bloodPressureData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Temperature Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              Body Temperature
            </CardTitle>
            <CardDescription>Core body temperature (°F)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={temperatureData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Statistics</CardTitle>
          <CardDescription>
            Maximum, minimum, and average values for the last hour
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Metric</th>
                  <th className="text-center py-2 px-4">Current</th>
                  <th className="text-center py-2 px-4">Max</th>
                  <th className="text-center py-2 px-4">Min</th>
                  <th className="text-center py-2 px-4">Average</th>
                </tr>
              </thead>
              <tbody>
                {statistics.map((stat, index) => (
                  <tr
                    key={stat.metric}
                    className={index % 2 === 0 ? "bg-muted/50" : ""}
                  >
                    <td className="py-3 px-4 font-medium">{stat.metric}</td>
                    <td
                      className={`text-center py-3 px-4 font-semibold ${stat.color}`}
                    >
                      {stat.current}
                      {stat.unit}
                    </td>
                    <td className="text-center py-3 px-4">
                      {stat.hourlyMax}
                      {stat.metric === "Blood Pressure"
                        ? `/${Math.round(
                            Math.max(...filteredData.map((d) => d.diastolic))
                          )}`
                        : stat.unit}
                    </td>
                    <td className="text-center py-3 px-4">
                      {stat.hourlyMin}
                      {stat.metric === "Blood Pressure"
                        ? `/${Math.round(
                            Math.min(...filteredData.map((d) => d.diastolic))
                          )}`
                        : stat.unit}
                    </td>
                    <td className="text-center py-3 px-4">
                      {stat.hourlyAvg}
                      {stat.metric === "Blood Pressure"
                        ? `/${Math.round(
                            filteredData.reduce(
                              (sum, d) => sum + d.diastolic,
                              0
                            ) / filteredData.length
                          )}`
                        : stat.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveMonitoringComponent;
