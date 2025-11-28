import { VitalSigns, TimeRange } from "../types";

export const filterDataByTimeRange = (
  data: VitalSigns[],
  timeRange: TimeRange
): VitalSigns[] => {
  const now = Date.now();
  const rangeInMs = parseInt(timeRange) * 60 * 1000;
  return data.filter((d) => {
    const timestamp = new Date(d.timestamp).getTime();
    return now - timestamp <= rangeInMs;
  });
};

export const createGradient = (
  ctx: CanvasRenderingContext2D,
  colorStart: string,
  colorEnd: string
) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
};
