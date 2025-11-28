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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-3 h-3 ${color} rounded-full`}></div>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};
