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
    settings: SEED_SETTINGS,
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    const base = defaultData();
    return {
      courses: parsed.courses ?? base.courses,
      deadlines: parsed.deadlines ?? base.deadlines,
      workoutProgram: parsed.workoutProgram ?? base.workoutProgram,
      workoutSessions: parsed.workoutSessions ?? base.workoutSessions,
      scrollLog: parsed.scrollLog ?? base.scrollLog,
      settings: { ...base.settings, ...parsed.settings },
    };
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
  const data = parsed.data ?? parsed;
  const base = defaultData();
  return {
    courses: data.courses ?? base.courses,
    deadlines: data.deadlines ?? base.deadlines,
    workoutProgram: data.workoutProgram ?? base.workoutProgram,
    workoutSessions: data.workoutSessions ?? base.workoutSessions,
    scrollLog: data.scrollLog ?? base.scrollLog,
    settings: { ...base.settings, ...data.settings },
  };
}
