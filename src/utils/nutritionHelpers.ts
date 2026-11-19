import type { NutritionLogEntry, NutritionTargets } from "../data/types";
import { toDateInputValue } from "./date";

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function totalsForDate(log: NutritionLogEntry[], date: string): MacroTotals {
  return log
    .filter((e) => e.date === date)
    .reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein: acc.protein + e.protein,
        carbs: acc.carbs + e.carbs,
        fat: acc.fat + e.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
}

export function remaining(targets: NutritionTargets, totals: MacroTotals): MacroTotals {
  return {
    calories: targets.calories - totals.calories,
    protein: targets.protein - totals.protein,
    carbs: targets.carbs - totals.carbs,
    fat: targets.fat - totals.fat,
  };
}

/** Average calories/protein per day over the `days` days ending at (and including) endDate. */
export function averageOverDays(
  log: NutritionLogEntry[],
  endDate: Date,
  days: number
): { calories: number; protein: number } {
  let calories = 0;
  let protein = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const totals = totalsForDate(log, toDateInputValue(d));
    calories += totals.calories;
    protein += totals.protein;
  }
  return { calories: Math.round(calories / days), protein: Math.round(protein / days) };
}
