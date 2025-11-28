"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatisticsData } from "../types";

interface CurrentValuesProps {
  statistics: StatisticsData[];
}

export const CurrentValues: React.FC<CurrentValuesProps> = ({ statistics }) => {
  return (
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
  );
};
