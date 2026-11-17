import type { Deadline } from "../data/types";

export interface DeadlineGroups {
  overdue: Deadline[];
  next7: Deadline[];
  later: Deadline[];
  done: Deadline[];
}

export function groupDeadlines(deadlines: Deadline[], now: Date): DeadlineGroups {
  const overdue: Deadline[] = [];
  const next7: Deadline[] = [];
  const later: Deadline[] = [];
  const done: Deadline[] = [];

  const sevenDaysMs = now.getTime() + 7 * 86400000;

  for (const d of deadlines) {
    if (d.done) {
      done.push(d);
      continue;
    }
    const dueMs = new Date(d.due).getTime();
    if (dueMs < now.getTime()) overdue.push(d);
    else if (dueMs <= sevenDaysMs) next7.push(d);
    else later.push(d);
  }

  overdue.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  next7.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  later.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  done.sort((a, b) => new Date(b.doneAt ?? b.due).getTime() - new Date(a.doneAt ?? a.due).getTime());

  return { overdue, next7, later, done };
}
