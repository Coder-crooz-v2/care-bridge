"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VitalChartProps {
  title: string;
  description: string;
  data: any;
  options: any;
  color: string;
}

export const VitalChart: React.FC<VitalChartProps> = ({
  title,
  description,
  data,
  options,
  color,
}) => {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
          <div className={`w-3 h-3 ${color} rounded-full`}></div>
          {title}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="h-48 sm:h-56 md:h-64">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};
