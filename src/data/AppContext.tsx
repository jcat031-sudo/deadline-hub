import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AppData,
  Course,
  Deadline,
  DeadlineType,
  Meal,
  NutritionLogEntry,
  ScrollLogEntry,
  Settings,
  WorkoutDay,
  WorkoutProgram,
  WorkoutSession,
} from "./types";
import { loadData, saveData, resetData as resetStoredData, exportBackup, parseBackup } from "./storage";
import { makeId } from "../utils/id";
import { toDateInputValue } from "../utils/date";

export interface NewDeadlineInput {
  course: string;
  title: string;
  type: DeadlineType;
  due: string;
  platform: string;
  notes: string;
}

export interface ImportDeadlineItem {
  course: string;
  title: string;
  type: DeadlineType;
  due: string;
  platform?: string;
  notes?: string;
}

interface AppContextValue {
  data: AppData;
  addDeadline: (input: NewDeadlineInput) => void;
  updateDeadline: (id: string, patch: Partial<NewDeadlineInput>) => void;
  deleteDeadline: (id: string) => void;
  toggleDeadlineDone: (id: string) => void;
  importDeadlines: (items: ImportDeadlineItem[]) => { added: number; skipped: number };
  findDuplicateDeadlines: (items: ImportDeadlineItem[]) => boolean[];

  addCourse: (course: Omit<Course, "id">) => void;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  updateWorkoutProgram: (program: WorkoutProgram) => void;
  setNextWorkoutDay: (day: WorkoutDay) => void;

  startWorkoutSession: (day: WorkoutDay) => WorkoutSession;
  updateWorkoutSession: (session: WorkoutSession) => void;
  finishWorkoutSession: (session: WorkoutSession) => void;

  addScrollMinutes: (minutes: number, source: string, deadlineId?: string) => void;

  addMeal: (meal: Omit<Meal, "id">) => void;
  updateMeal: (id: string, patch: Partial<Omit<Meal, "id">>) => void;
  deleteMeal: (id: string) => void;
  logMealToDate: (mealId: string, servings: number, date: string) => void;
  quickAddNutritionEntry: (
    input: { name: string; calories: number; protein: number; carbs: number; fat: number; date: string },
    saveAsMeal: boolean
  ) => void;
  deleteNutritionLogEntry: (id: string) => void;

  upsertWeightEntry: (date: string, weight: number) => void;
  deleteWeightEntry: (id: string) => void;

  exportBackupString: () => string;
  importBackupString: (json: string) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function nextWorkoutRotation(current: WorkoutDay): WorkoutDay {
  if (current === "Push") return "Pull";
  if (current === "Pull") return "Legs";
  return "Push";
}

function runShortcut(name: string, text: string) {
  const url = `shortcuts://run-shortcut?name=${encodeURIComponent(name)}&input=text&text=${encodeURIComponent(text)}`;
  window.location.href = url;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const value = useMemo<AppContextValue>(() => {
    function addDeadline(input: NewDeadlineInput) {
      const deadline: Deadline = {
        id: makeId(),
        course: input.course,
        title: input.title,
        type: input.type,
        due: input.due,
        platform: input.platform,
        notes: input.notes,
        done: false,
        createdAt: new Date().toISOString(),
      };
      setData((d) => ({ ...d, deadlines: [...d.deadlines, deadline] }));
    }

    function updateDeadline(id: string, patch: Partial<NewDeadlineInput>) {
      setData((d) => ({
        ...d,
        deadlines: d.deadlines.map((dl) => (dl.id === id ? { ...dl, ...patch } : dl)),
      }));
    }

    function deleteDeadline(id: string) {
      setData((d) => ({ ...d, deadlines: d.deadlines.filter((dl) => dl.id !== id) }));
    }

    function toggleDeadlineDone(id: string) {
      setData((d) => {
        const deadline = d.deadlines.find((dl) => dl.id === id);
        if (!deadline) return d;
        const nowDone = !deadline.done;
        let scrollLog = d.scrollLog;
        let minutesAwarded = deadline.minutesAwarded ?? false;

        if (nowDone && !minutesAwarded) {
          const minutes = d.settings.rewardMinutes[deadline.type] ?? 0;
          if (minutes > 0) {
            const entry: ScrollLogEntry = {
              id: makeId(),
              date: toDateInputValue(new Date()),
              minutes,
              source: deadline.title,
              deadlineId: deadline.id,
            };
            scrollLog = [...scrollLog, entry];
            minutesAwarded = true;
            runShortcut("Earn Minutes", String(minutes));
          }
        }

        return {
          ...d,
          scrollLog,
          deadlines: d.deadlines.map((dl) =>
            dl.id === id
              ? { ...dl, done: nowDone, doneAt: nowDone ? new Date().toISOString() : undefined, minutesAwarded }
              : dl
          ),
        };
      });
    }

    function isDuplicate(existing: Deadline[], item: ImportDeadlineItem): boolean {
      return existing.some(
        (dl) =>
          dl.course.trim().toLowerCase() === item.course.trim().toLowerCase() &&
          dl.title.trim().toLowerCase() === item.title.trim().toLowerCase() &&
          dl.due === item.due
      );
    }

    function findDuplicateDeadlines(items: ImportDeadlineItem[]): boolean[] {
      return items.map((item) => isDuplicate(data.deadlines, item));
    }

    function importDeadlines(items: ImportDeadlineItem[]) {
      let added = 0;
      let skipped = 0;
      setData((d) => {
        const newOnes: Deadline[] = [];
        for (const item of items) {
          if (isDuplicate([...d.deadlines, ...newOnes], item)) {
            skipped++;
            continue;
          }
          newOnes.push({
            id: makeId(),
            course: item.course,
            title: item.title,
            type: item.type,
            due: item.due,
            platform: item.platform ?? "",
            notes: item.notes ?? "",
            done: false,
            createdAt: new Date().toISOString(),
          });
          added++;
        }
        return { ...d, deadlines: [...d.deadlines, ...newOnes] };
      });
      return { added, skipped };
    }

    function addCourse(course: Omit<Course, "id">) {
      setData((d) => ({ ...d, courses: [...d.courses, { ...course, id: makeId() }] }));
    }

    function updateCourse(id: string, patch: Partial<Course>) {
      setData((d) => ({
        ...d,
        courses: d.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }));
    }

    function deleteCourse(id: string) {
      setData((d) => ({ ...d, courses: d.courses.filter((c) => c.id !== id) }));
    }

    function updateSettings(patch: Partial<Settings>) {
      setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
    }

    function updateWorkoutProgram(program: WorkoutProgram) {
      setData((d) => ({ ...d, workoutProgram: program }));
    }

    function setNextWorkoutDay(day: WorkoutDay) {
      setData((d) => ({ ...d, settings: { ...d.settings, nextWorkoutDay: day } }));
    }

    function startWorkoutSession(day: WorkoutDay): WorkoutSession {
      const session: WorkoutSession = {
        id: makeId(),
        day,
        date: new Date().toISOString(),
        exercises: [],
      };
      return session;
    }

    function updateWorkoutSession(session: WorkoutSession) {
      setData((d) => {
        const exists = d.workoutSessions.some((s) => s.id === session.id);
        return {
          ...d,
          workoutSessions: exists
            ? d.workoutSessions.map((s) => (s.id === session.id ? session : s))
            : [...d.workoutSessions, session],
        };
      });
    }

    function finishWorkoutSession(session: WorkoutSession) {
      setData((d) => {
        const finished = { ...session, finishedAt: new Date().toISOString() };
        const exists = d.workoutSessions.some((s) => s.id === session.id);
        const workoutSessions = exists
          ? d.workoutSessions.map((s) => (s.id === session.id ? finished : s))
          : [...d.workoutSessions, finished];
        return {
          ...d,
          workoutSessions,
          settings: { ...d.settings, nextWorkoutDay: nextWorkoutRotation(session.day) },
        };
      });
    }

    function addScrollMinutes(minutes: number, source: string, deadlineId?: string) {
      setData((d) => ({
        ...d,
        scrollLog: [
          ...d.scrollLog,
          { id: makeId(), date: toDateInputValue(new Date()), minutes, source, deadlineId },
        ],
      }));
    }

    function addMeal(meal: Omit<Meal, "id">) {
      setData((d) => ({ ...d, meals: [...d.meals, { ...meal, id: makeId() }] }));
    }

    function updateMeal(id: string, patch: Partial<Omit<Meal, "id">>) {
      setData((d) => ({ ...d, meals: d.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
    }

    function deleteMeal(id: string) {
      setData((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== id) }));
    }

    function logMealToDate(mealId: string, servings: number, date: string) {
      setData((d) => {
        const meal = d.meals.find((m) => m.id === mealId);
        if (!meal) return d;
        const entry: NutritionLogEntry = {
          id: makeId(),
          date,
          mealId: meal.id,
          name: meal.name,
          servings,
          calories: Math.round(meal.calories * servings),
          protein: Math.round(meal.protein * servings),
          carbs: Math.round(meal.carbs * servings),
          fat: Math.round(meal.fat * servings),
          createdAt: new Date().toISOString(),
        };
        return { ...d, nutritionLog: [...d.nutritionLog, entry] };
      });
    }

    function quickAddNutritionEntry(
      input: { name: string; calories: number; protein: number; carbs: number; fat: number; date: string },
      saveAsMeal: boolean
    ) {
      setData((d) => {
        const entry: NutritionLogEntry = {
          id: makeId(),
          date: input.date,
          name: input.name,
          servings: 1,
          calories: input.calories,
          protein: input.protein,
          carbs: input.carbs,
          fat: input.fat,
          createdAt: new Date().toISOString(),
        };
        const meals = saveAsMeal
          ? [
              ...d.meals,
              {
                id: makeId(),
                name: input.name,
                calories: input.calories,
                protein: input.protein,
                carbs: input.carbs,
                fat: input.fat,
              },
            ]
          : d.meals;
        return { ...d, nutritionLog: [...d.nutritionLog, entry], meals };
      });
    }

    function deleteNutritionLogEntry(id: string) {
      setData((d) => ({ ...d, nutritionLog: d.nutritionLog.filter((e) => e.id !== id) }));
    }

    function upsertWeightEntry(date: string, weight: number) {
      setData((d) => {
        const existing = d.weightLog.find((w) => w.date === date);
        const weightLog = existing
          ? d.weightLog.map((w) => (w.date === date ? { ...w, weight } : w))
          : [...d.weightLog, { id: makeId(), date, weight }];
        return { ...d, weightLog };
      });
    }

    function deleteWeightEntry(id: string) {
      setData((d) => ({ ...d, weightLog: d.weightLog.filter((w) => w.id !== id) }));
    }

    function exportBackupString() {
      return exportBackup(data);
    }

    function importBackupString(json: string) {
      const parsed = parseBackup(json);
      setData(parsed);
    }

    function resetAll() {
      setData(resetStoredData());
    }

    return {
      data,
      addDeadline,
      updateDeadline,
      deleteDeadline,
      toggleDeadlineDone,
      importDeadlines,
      findDuplicateDeadlines,
      addCourse,
      updateCourse,
      deleteCourse,
      updateSettings,
      updateWorkoutProgram,
      setNextWorkoutDay,
      startWorkoutSession,
      updateWorkoutSession,
      finishWorkoutSession,
      addScrollMinutes,
      addMeal,
      updateMeal,
      deleteMeal,
      logMealToDate,
      quickAddNutritionEntry,
      deleteNutritionLogEntry,
      upsertWeightEntry,
      deleteWeightEntry,
      exportBackupString,
      importBackupString,
      resetAll,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
