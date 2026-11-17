import type { ExerciseDef, SetLog, WorkoutSession } from "../data/types";

export function lastLoggedSets(
  sessions: WorkoutSession[],
  exerciseId: string,
  excludeSessionId?: string
): SetLog[] | null {
  const candidates = sessions
    .filter((s) => s.id !== excludeSessionId && s.finishedAt)
    .filter((s) => s.exercises.some((e) => e.exerciseId === exerciseId))
    .sort((a, b) => new Date(b.finishedAt!).getTime() - new Date(a.finishedAt!).getTime());

  if (candidates.length === 0) return null;
  const log = candidates[0].exercises.find((e) => e.exerciseId === exerciseId);
  return log?.sets ?? null;
}

/** True if every main (non back-off) set from the last session hit the top of the rep range. */
export function shouldProgress(def: ExerciseDef, lastSets: SetLog[] | null): boolean {
  if (!lastSets || lastSets.length === 0) return false;
  const mainSets = lastSets.slice(0, def.sets);
  if (mainSets.length < def.sets) return false;
  return mainSets.every((s) => s.reps >= def.repRangeHigh && s.weight > 0);
}

export function emptySetsFor(def: ExerciseDef, lastSets: SetLog[] | null): SetLog[] {
  const totalSets = def.sets + (def.backOff ? 1 : 0);
  return Array.from({ length: totalSets }, (_, i) => ({
    weight: lastSets?.[i]?.weight ?? 0,
    reps: 0,
  }));
}
