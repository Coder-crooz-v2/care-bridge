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
  );
};
