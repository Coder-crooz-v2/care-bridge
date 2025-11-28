"use client";

import { VitalSigns } from "../types";
import { createGradient } from "../utils/dataHelpers";

export const useChartConfig = (filteredData: VitalSigns[]) => {
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

  return {
    chartOptions,
    heartRateData,
    spo2Data,
    bloodPressureData,
    temperatureData,
  };
};
