export type DayCode = "Mo" | "Tu" | "We" | "Th" | "Fr" | "Sa" | "Su";

export interface ClassMeeting {
  id: string;
  days: DayCode[];
  startTime: string; // "HH:MM" 24h
  endTime: string; // "HH:MM" 24h
  room: string;
  label?: string; // e.g. "Lecture", "Lab", "Discussion"
}

export interface Course {
  id: string;
  code: string; // "ES 220"
  name: string; // "Statics"
  instructor: string;
  color: string; // hex
  meetings: ClassMeeting[];
}

export type DeadlineType =
  | "homework"
  | "quiz"
  | "lab report"
  | "project"
  | "midterm"
  | "final"
  | "other";

export interface Deadline {
  id: string;
  course: string; // course code, free text so import works even w/o matching course
  title: string;
  type: DeadlineType;
  due: string; // ISO local "YYYY-MM-DDTHH:MM"
  platform: string;
  notes: string;
  done: boolean;
  doneAt?: string;
  createdAt: string;
  minutesAwarded?: boolean;
}

export type WorkoutDay = "Push" | "Pull" | "Legs";

export interface ExerciseDef {
  id: string;
  name: string;
  sets: number;
  repRangeLow: number;
  repRangeHigh: number;
  progressionIncrement: number; // lb to add when progression flag fires
  backOff?: { repLow: number; repHigh: number }; // optional extra back-off set, excluded from progression check
}

export type WorkoutProgram = Record<WorkoutDay, ExerciseDef[]>;

export interface SetLog {
  weight: number;
  reps: number;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  sets: SetLog[];
}

export interface WorkoutSession {
  id: string;
  day: WorkoutDay;
  date: string; // ISO date started
  finishedAt?: string;
  exercises: ExerciseLog[];
}

export interface ScrollLogEntry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  minutes: number;
  source: string; // deadline title that earned it, or "manual"
  deadlineId?: string;
}

export interface RewardMinutes {
  homework: number;
  quiz: number;
  "lab report": number;
  project: number;
  midterm: number;
  final: number;
  other: number;
}

export interface Settings {
  semesterStart: string; // YYYY-MM-DD
  semesterEnd: string; // YYYY-MM-DD
  rewardMinutes: RewardMinutes;
  nextWorkoutDay: WorkoutDay;
}

export interface AppData {
  courses: Course[];
  deadlines: Deadline[];
  workoutProgram: WorkoutProgram;
  workoutSessions: WorkoutSession[];
  scrollLog: ScrollLogEntry[];
  settings: Settings;
}
