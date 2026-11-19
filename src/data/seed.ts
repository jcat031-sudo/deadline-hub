import type { Course, WorkoutProgram, Settings } from "./types";

export const SEED_COURSES: Course[] = [
  {
    id: "em331",
    code: "EM 331",
    name: "Operations & Supply Chain Mgt",
    instructor: "Santosh K Mahapatra",
    color: "#2563EB",
    meetings: [
      {
        id: "em331-lec",
        days: ["Tu", "Th"],
        startTime: "15:30",
        endTime: "16:45",
        room: "175 Snell Hall",
      },
    ],
  },
  {
    id: "es220",
    code: "ES 220",
    name: "Statics",
    instructor: "Connor P Edson",
    color: "#DC2626",
    meetings: [
      {
        id: "es220-lec",
        days: ["Mo", "We", "Fr"],
        startTime: "09:00",
        endTime: "09:50",
        room: "244 Rowley Lab",
      },
    ],
  },
  {
    id: "fn361",
    code: "FN 361",
    name: "Financial Management",
    instructor: "Allan Arthur Zebedee",
    color: "#D97706",
    meetings: [
      {
        id: "fn361-lec",
        days: ["Tu", "Th"],
        startTime: "09:30",
        endTime: "10:45",
        room: "212 Snell Hall",
      },
    ],
  },
  {
    id: "ma232",
    code: "MA 232",
    name: "Elementary Differential Eq",
    instructor: "Prashant Athavale",
    color: "#7C3AED",
    meetings: [
      {
        id: "ma232-lec",
        days: ["Mo", "We", "Fr"],
        startTime: "12:00",
        endTime: "12:50",
        room: "360 Science Center",
        label: "Lecture",
      },
      {
        id: "ma232-disc",
        days: ["Tu"],
        startTime: "13:00",
        endTime: "13:50",
        room: "382 Science Center",
        label: "Discussion",
      },
    ],
  },
  {
    id: "mk320",
    code: "MK 320",
    name: "Principles of Marketing",
    instructor: "Krista Larock Wells",
    color: "#0891B2",
    meetings: [
      {
        id: "mk320-lec",
        days: ["Mo", "We", "Fr"],
        startTime: "13:00",
        endTime: "13:50",
        room: "177 Snell Hall",
      },
    ],
  },
  {
    id: "ph132",
    code: "PH 132",
    name: "Physics II",
    instructor: "Michael W. Ramsdell & Benjamin Richard Roulston",
    color: "#DB2777",
    meetings: [
      {
        id: "ph132-lec",
        days: ["Mo", "We", "Fr"],
        startTime: "10:00",
        endTime: "10:50",
        room: "362 Science Center",
        label: "Lecture",
      },
      {
        id: "ph132-lab",
        days: ["Mo"],
        startTime: "15:00",
        endTime: "16:50",
        room: "272 Science Center",
        label: "Lab",
      },
    ],
  },
];

export const SEED_WORKOUT_PROGRAM: WorkoutProgram = {
  Push: [
    { id: "push-1", name: "Incline Smith press", sets: 4, repRangeLow: 6, repRangeHigh: 8, progressionIncrement: 5 },
    { id: "push-2", name: "Military press", sets: 3, repRangeLow: 6, repRangeHigh: 8, progressionIncrement: 5 },
    { id: "push-3", name: "Incline machine chest press", sets: 3, repRangeLow: 8, repRangeHigh: 10, progressionIncrement: 5 },
    { id: "push-4", name: "Pec deck", sets: 3, repRangeLow: 10, repRangeHigh: 15, progressionIncrement: 5 },
    { id: "push-5", name: "Dumbbell lateral raises", sets: 3, repRangeLow: 12, repRangeHigh: 15, progressionIncrement: 5 },
    { id: "push-6", name: "Overhead tricep extension", sets: 3, repRangeLow: 10, repRangeHigh: 12, progressionIncrement: 5 },
  ],
  Pull: [
    { id: "pull-1", name: "Lat pulldown", sets: 4, repRangeLow: 6, repRangeHigh: 10, progressionIncrement: 5 },
    { id: "pull-2", name: "Chest-supported row", sets: 3, repRangeLow: 8, repRangeHigh: 10, progressionIncrement: 5 },
    { id: "pull-3", name: "Overhead cable lat pullover", sets: 3, repRangeLow: 10, repRangeHigh: 12, progressionIncrement: 5 },
    { id: "pull-4", name: "Rear delt flies", sets: 3, repRangeLow: 12, repRangeHigh: 15, progressionIncrement: 5 },
    { id: "pull-5", name: "Shrugs", sets: 3, repRangeLow: 8, repRangeHigh: 12, progressionIncrement: 5 },
    { id: "pull-6", name: "Hammer curls", sets: 3, repRangeLow: 8, repRangeHigh: 10, progressionIncrement: 5 },
    { id: "pull-7", name: "Seated bicep curls", sets: 3, repRangeLow: 10, repRangeHigh: 12, progressionIncrement: 5 },
  ],
  Legs: [
    { id: "legs-1", name: "Leg press", sets: 4, repRangeLow: 6, repRangeHigh: 10, progressionIncrement: 10, backOff: { repLow: 15, repHigh: 20 } },
    { id: "legs-2", name: "Seated leg curl", sets: 3, repRangeLow: 10, repRangeHigh: 12, progressionIncrement: 5 },
    { id: "legs-3", name: "Leg extensions", sets: 3, repRangeLow: 10, repRangeHigh: 12, progressionIncrement: 5 },
    { id: "legs-4", name: "Hip abductors", sets: 3, repRangeLow: 12, repRangeHigh: 15, progressionIncrement: 5 },
    { id: "legs-5", name: "Calf raises", sets: 4, repRangeLow: 10, repRangeHigh: 15, progressionIncrement: 5 },
  ],
};

export const SEED_SETTINGS: Settings = {
  semesterStart: "2027-01-11",
  semesterEnd: "2027-04-30",
  rewardMinutes: {
    homework: 15,
    quiz: 20,
    "lab report": 30,
    project: 45,
    midterm: 60,
    final: 60,
    other: 10,
  },
  nextWorkoutDay: "Push",
  nutritionTargets: {
    calories: 3700,
    protein: 200,
    carbs: 500,
    fat: 100,
  },
};
