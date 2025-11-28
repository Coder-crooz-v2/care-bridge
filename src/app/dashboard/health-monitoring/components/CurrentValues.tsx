"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatisticsData } from "../types";

interface CurrentValuesProps {
  statistics: StatisticsData[];
}

export const CurrentValues: React.FC<CurrentValuesProps> = ({ statistics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
      {statistics.map((stat) => (
        <Card key={stat.metric} className="text-center">
          <CardContent className="p-3 sm:p-6">
            <div
              className={`text-3xl sm:text-4xl md:text-5xl font-bold ${stat.color} mb-1`}
            >
              {stat.current}
              <span className="text-sm sm:text-base md:text-lg font-normal ml-1">
                {stat.unit}
              </span>
            </div>
            <div
              className={`text-sm sm:text-base md:text-lg font-bold ${stat.color}`}
            >
              {stat.metric}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
