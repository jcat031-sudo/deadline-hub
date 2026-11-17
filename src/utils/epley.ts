/** Epley formula estimated one-rep max. */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function topSet(sets: { weight: number; reps: number }[]): { weight: number; reps: number } | null {
  if (sets.length === 0) return null;
  return sets.reduce((best, s) => (estimate1RM(s.weight, s.reps) > estimate1RM(best.weight, best.reps) ? s : best));
}
