"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeRange } from "../types";

interface TimeRangeFilterProps {
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
  isConnected: boolean;
}

export const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({
  timeRange,
  onTimeRangeChange,
  isConnected,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <label htmlFor="timeRange" className="text-sm font-medium">
          Time Range:
        </label>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
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
  );
};
