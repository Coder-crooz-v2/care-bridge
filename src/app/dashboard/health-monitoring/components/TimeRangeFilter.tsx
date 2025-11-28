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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
      <div className="flex items-center gap-2 sm:gap-4">
        <label htmlFor="timeRange" className="text-xs sm:text-sm font-medium">
          Time Range:
        </label>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-[140px] sm:w-[180px] text-xs sm:text-sm">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10" className="text-xs sm:text-sm">
              Last 10 minutes
            </SelectItem>
            <SelectItem value="30" className="text-xs sm:text-sm">
              Last 30 minutes
            </SelectItem>
            <SelectItem value="60" className="text-xs sm:text-sm">
              Last 1 hour
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-xs sm:text-sm font-medium">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </div>
  );
};
