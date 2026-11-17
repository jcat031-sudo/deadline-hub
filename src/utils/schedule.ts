import type { Course, ClassMeeting, Settings } from "../data/types";
import {
  DAY_ORDER,
  combineDateAndTime,
  dayCodeFromDate,
  isWithinSemester,
  parseTimeToMinutes,
} from "./date";

export interface MeetingInstance {
  course: Course;
  meeting: ClassMeeting;
  start: Date;
  end: Date;
}

/** All meeting instances occurring on the given calendar date, sorted by start time. */
export function meetingsOnDate(
  courses: Course[],
  settings: Settings,
  date: Date
): MeetingInstance[] {
  if (!isWithinSemester(date, settings.semesterStart, settings.semesterEnd)) {
    return [];
  }
  const dayCode = dayCodeFromDate(date);
  const instances: MeetingInstance[] = [];
  for (const course of courses) {
    for (const meeting of course.meetings) {
      if (meeting.days.includes(dayCode)) {
        instances.push({
          course,
          meeting,
          start: combineDateAndTime(date, meeting.startTime),
          end: combineDateAndTime(date, meeting.endTime),
        });
      }
    }
  }
  instances.sort((a, b) => a.start.getTime() - b.start.getTime());
  return instances;
}

export interface NextClassInfo {
  instance: MeetingInstance;
  inSession: boolean;
  minutesUntil: number;
}

/** Finds the class currently in session, or the next upcoming one within the next 7 days. */
export function findNextClass(
  courses: Course[],
  settings: Settings,
  now: Date
): NextClassInfo | null {
  for (let offset = 0; offset < 7; offset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + offset);
    const instances = meetingsOnDate(courses, settings, day);
    for (const inst of instances) {
      if (offset === 0) {
        if (now >= inst.start && now <= inst.end) {
          return { instance: inst, inSession: true, minutesUntil: 0 };
        }
        if (inst.start > now) {
          const minutesUntil = Math.round((inst.start.getTime() - now.getTime()) / 60000);
          return { instance: inst, inSession: false, minutesUntil };
        }
      } else {
        const minutesUntil = Math.round((inst.start.getTime() - now.getTime()) / 60000);
        return { instance: inst, inSession: false, minutesUntil };
      }
    }
  }
  return null;
}

/** Builds a Mon-Sun grid of meetings for the weekly schedule view. */
export function weeklyGrid(
  courses: Course[]
): Record<string, { course: Course; meeting: ClassMeeting }[]> {
  const grid: Record<string, { course: Course; meeting: ClassMeeting }[]> = {};
  for (const day of DAY_ORDER) grid[day] = [];
  for (const course of courses) {
    for (const meeting of course.meetings) {
      for (const day of meeting.days) {
        grid[day].push({ course, meeting });
      }
    }
  }
  for (const day of DAY_ORDER) {
    grid[day].sort(
      (a, b) => parseTimeToMinutes(a.meeting.startTime) - parseTimeToMinutes(b.meeting.startTime)
    );
  }
  return grid;
}
