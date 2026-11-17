import type { DayCode } from "../data/types";

export const DAY_ORDER: DayCode[] = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const DAY_LABELS: Record<DayCode, string> = {
  Mo: "Monday",
  Tu: "Tuesday",
  We: "Wednesday",
  Th: "Thursday",
  Fr: "Friday",
  Sa: "Saturday",
  Su: "Sunday",
};

export function dayLabel(d: DayCode): string {
  return DAY_LABELS[d];
}

export function dayCodeFromDate(d: Date): DayCode {
  return DAY_ORDER[(d.getDay() + 6) % 7];
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function combineDateAndTime(date: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const result = new Date(date);
  result.setHours(h, m, 0, 0);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatTime12(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime12(start)}–${formatTime12(end)}`;
}

export function greeting(now: Date, name: string): string {
  const h = now.getHours();
  if (h < 12) return `Good morning, ${name}`;
  if (h < 18) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export function formatLongDate(now: Date): string {
  return now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function toDateInputValue(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isWithinSemester(
  date: Date,
  semesterStart: string,
  semesterEnd: string
): boolean {
  const d = toDateInputValue(date);
  return d >= semesterStart && d <= semesterEnd;
}

/** Countdown string relative to now, for a target Date. */
export function formatCountdown(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  const pastMs = -diffMs;

  if (diffMs <= 0) {
    // In the past (overdue)
    const mins = Math.round(pastMs / 60000);
    if (mins < 60) return `${mins} m late`;
    const hours = Math.round(pastMs / 3600000);
    if (hours < 24) return `${hours} h late`;
    const days = Math.round(pastMs / 86400000);
    return `${days} d late`;
  }

  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `in ${mins} m`;
  const hours = Math.round(diffMs / 3600000);
  if (hours < 24) return `in ${hours} h`;
  const days = Math.floor(diffMs / 86400000);
  const remHours = Math.round((diffMs - days * 86400000) / 3600000);
  if (days < 7) {
    return remHours > 0 ? `in ${days} d ${remHours} h` : `in ${days} d`;
  }
  const weeks = Math.round(days / 7);
  return `in ${weeks} wk`;
}

export function formatClassIn(mins: number): string {
  if (mins <= 0) return "Now";
  if (mins < 60) return `in ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `in ${h} h ${m} m` : `in ${h} h`;
}
