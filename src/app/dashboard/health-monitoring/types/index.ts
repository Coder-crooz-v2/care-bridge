export interface VitalSigns {
  timestamp: string;
  heartRate: number;
  spo2: number;
  systolic: number;
  diastolic: number;
  temperature: number;
}

export interface StatisticsData {
  metric: string;
  current: number;
  unit: string;
  hourlyMax: number;
  hourlyMin: number;
  hourlyAvg: number;
  color: string;
}

export type TimeRange = "10" | "30" | "60";
