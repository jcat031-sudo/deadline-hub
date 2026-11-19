import type { WeightEntry } from "../data/types";

export type WeightRange = "1W" | "1M" | "3M" | "All";

const RANGE_DAYS: Record<Exclude<WeightRange, "All">, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
};

export function sortedByDate(log: WeightEntry[]): WeightEntry[] {
  return [...log].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function filterByRange(log: WeightEntry[], range: WeightRange): WeightEntry[] {
  const sorted = sortedByDate(log);
  if (range === "All") return sorted;
  const days = RANGE_DAYS[range];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return sorted.filter((e) => e.date >= cutoffStr);
}

/** Trailing 7-day average for each entry's date, computed over all entries (not just the visible range). */
export function movingAverageSeries(fullLog: WeightEntry[], visible: WeightEntry[], windowDays = 7) {
  const sorted = sortedByDate(fullLog);
  return visible.map((entry) => {
    const entryTime = new Date(entry.date).getTime();
    const windowStart = entryTime - (windowDays - 1) * 86400000;
    const inWindow = sorted.filter((e) => {
      const t = new Date(e.date).getTime();
      return t >= windowStart && t <= entryTime;
    });
    const avg = inWindow.reduce((s, e) => s + e.weight, 0) / inWindow.length;
    return { date: entry.date, value: avg };
  });
}

/** Change in weight (lb) over the last N days, comparing the latest entry to the closest entry at/before N days earlier. */
export function changeOverDays(fullLog: WeightEntry[], days: number): number | null {
  const sorted = sortedByDate(fullLog);
  if (sorted.length === 0) return null;
  const latest = sorted[sorted.length - 1];
  const cutoff = new Date(latest.date);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const before = [...sorted].reverse().find((e) => e.date <= cutoffStr);
  if (!before) return null;
  return latest.weight - before.weight;
}

/** Weekly rate of change (lb/week) via least-squares linear regression over the given entries. */
export function weeklyRateOfChange(entries: WeightEntry[]): number | null {
  const sorted = sortedByDate(entries);
  if (sorted.length < 2) return null;
  const t0 = new Date(sorted[0].date).getTime();
  const points = sorted.map((e) => ({
    x: (new Date(e.date).getTime() - t0) / 86400000,
    y: e.weight,
  }));
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;
  const slopePerDay = (n * sumXY - sumX * sumY) / denom;
  return slopePerDay * 7;
}
