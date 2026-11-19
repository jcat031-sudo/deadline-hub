import type { AppData } from "./types";
import { SEED_COURSES, SEED_WORKOUT_PROGRAM, SEED_SETTINGS } from "./seed";

const STORAGE_KEY = "deadline-hub:data:v1";

function defaultData(): AppData {
  return {
    courses: SEED_COURSES,
    deadlines: [],
    workoutProgram: SEED_WORKOUT_PROGRAM,
    workoutSessions: [],
    scrollLog: [],
    meals: [],
    nutritionLog: [],
    weightLog: [],
    settings: SEED_SETTINGS,
  };
}

// Field-by-field fallback (never a blind spread) so that data saved by an
// older version of the app — missing fields this version added later, like
// meals/nutritionLog/weightLog or settings.nutritionTargets — merges cleanly
// with defaults instead of losing anything or crashing. Existing workout
// logs, deadlines, courses, etc. are preserved as-is.
function hydrate(data: Partial<AppData> | null | undefined): AppData {
  const base = defaultData();
  const d = data ?? {};
  return {
    courses: d.courses ?? base.courses,
    deadlines: d.deadlines ?? base.deadlines,
    workoutProgram: d.workoutProgram ?? base.workoutProgram,
    workoutSessions: d.workoutSessions ?? base.workoutSessions,
    scrollLog: d.scrollLog ?? base.scrollLog,
    meals: d.meals ?? base.meals,
    nutritionLog: d.nutritionLog ?? base.nutritionLog,
    weightLog: d.weightLog ?? base.weightLog,
    settings: {
      ...base.settings,
      ...d.settings,
      rewardMinutes: { ...base.settings.rewardMinutes, ...d.settings?.rewardMinutes },
      nutritionTargets: { ...base.settings.nutritionTargets, ...d.settings?.nutritionTargets },
    },
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    return hydrate(JSON.parse(raw) as Partial<AppData>);
  } catch (e) {
    console.error("Failed to load data, resetting to defaults", e);
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): AppData {
  localStorage.removeItem(STORAGE_KEY);
  return defaultData();
}

export function exportBackup(data: AppData): string {
  return JSON.stringify(
    { exportedAt: new Date().toISOString(), app: "Deadline Hub", version: 1, data },
    null,
    2
  );
}

export function parseBackup(json: string): AppData {
  const parsed = JSON.parse(json);
  return hydrate(parsed.data ?? parsed);
}
