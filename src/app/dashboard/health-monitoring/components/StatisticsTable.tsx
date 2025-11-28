"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatisticsData, VitalSigns } from "../types";

interface StatisticsTableProps {
  statistics: StatisticsData[];
  filteredData: VitalSigns[];
}

export const StatisticsTable: React.FC<StatisticsTableProps> = ({
  statistics,
  filteredData,
}) => {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl">
          Hourly Statistics
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Maximum, minimum, and average values for the last hour
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 sm:px-4">Metric</th>
                <th className="text-center py-2 px-2 sm:px-4">Current</th>
                <th className="text-center py-2 px-2 sm:px-4">Max</th>
                <th className="text-center py-2 px-2 sm:px-4">Min</th>
                <th className="text-center py-2 px-2 sm:px-4">Average</th>
              </tr>
            </thead>
            <tbody>
              {statistics.map((stat, index) => (
                <tr
                  key={stat.metric}
                  className={index % 2 === 0 ? "bg-muted/50" : ""}
                >
                  <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm md:text-base">
                    {stat.metric}
                  </td>
                  <td
                    className={`text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold ${stat.color} text-xs sm:text-sm md:text-base`}
                  >
                    {stat.current}
                    {stat.unit}
                  </td>
                  <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">
                    {stat.hourlyMax}
                    {stat.metric === "Blood Pressure"
                      ? `/${Math.round(
                          Math.max(...filteredData.map((d) => d.diastolic))
                        )}`
                      : stat.unit}
                  </td>
                  <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">
                    {stat.hourlyMin}
                    {stat.metric === "Blood Pressure"
                      ? `/${Math.round(
                          Math.min(...filteredData.map((d) => d.diastolic))
                        )}`
                      : stat.unit}
                  </td>
                  <td className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm md:text-base">
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
  );
};
