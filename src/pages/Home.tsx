import { useApp } from "../data/AppContext";
import { useNow } from "../hooks/useNow";
import Card from "../components/Card";
import type { TabKey } from "../components/BottomNav";
import type { FitnessSegment } from "./Fitness";
import { findNextClass } from "../utils/schedule";
import { formatClassIn, formatCountdown, formatLongDate, formatTime12, greeting, toDateInputValue } from "../utils/date";
import { remaining, totalsForDate } from "../utils/nutritionHelpers";

export default function Home({
  onNavigate,
}: {
  onNavigate: (tab: TabKey, fitnessSegment?: FitnessSegment) => void;
}) {
  const { data } = useApp();
  const now = useNow();

  const nextClass = findNextClass(data.courses, data.settings, now);

  const upcoming48h = data.deadlines
    .filter((d) => !d.done)
    .filter((d) => {
      const due = new Date(d.due).getTime();
      return due - now.getTime() <= 48 * 3600 * 1000;
    })
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

  const nextExam = data.deadlines
    .filter((d) => !d.done && (d.type === "midterm" || d.type === "final"))
    .filter((d) => new Date(d.due).getTime() > now.getTime())
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())[0];

  const todayStr = toDateInputValue(now);
  const scrollToday = data.scrollLog
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.minutes, 0);

  const nutritionRemaining = remaining(data.settings.nutritionTargets, totalsForDate(data.nutritionLog, todayStr));

  return (
    <div>
      <div className="home-greeting">
        <h2>{greeting(now, "Jackson")}</h2>
        <p>{formatLongDate(now)}</p>
      </div>

      <Card onClick={() => onNavigate("school")} accent="var(--accent)">
        <p className="card__title">Next class</p>
        {nextClass ? (
          <>
            <p className="card__main">{nextClass.instance.course.code}</p>
            <div className="card__row">
              <p className="card__sub">
                {formatTime12(nextClass.instance.meeting.startTime)} &middot; {nextClass.instance.meeting.room}
              </p>
              <span className="badge badge--accent">
                {nextClass.inSession ? "Now" : formatClassIn(nextClass.minutesUntil)}
              </span>
            </div>
          </>
        ) : (
          <p className="card__sub">No upcoming classes</p>
        )}
      </Card>

      <Card onClick={() => onNavigate("school")}>
        <p className="card__title">Due in the next 48 hours</p>
        {upcoming48h.length === 0 ? (
          <p className="card__sub">Nothing due soon &mdash; you're clear</p>
        ) : (
          <>
            <p className="card__main">
              {upcoming48h.length} item{upcoming48h.length > 1 ? "s" : ""}
            </p>
            <p className="card__sub">
              {upcoming48h[0].course}: {upcoming48h[0].title} &middot; {formatCountdown(new Date(upcoming48h[0].due), now)}
            </p>
          </>
        )}
      </Card>

      <Card onClick={() => onNavigate("school")}>
        <p className="card__title">Next exam</p>
        {nextExam ? (
          <>
            <p className="card__main">
              {nextExam.course}: {nextExam.title}
            </p>
            <p className="card__sub">{formatCountdown(new Date(nextExam.due), now)}</p>
          </>
        ) : (
          <p className="card__sub">No exams scheduled</p>
        )}
      </Card>

      <Card onClick={() => onNavigate("fitness", "workout")}>
        <p className="card__title">Today's workout</p>
        <p className="card__main">{data.settings.nextWorkoutDay} day</p>
        <p className="card__sub">{data.workoutProgram[data.settings.nextWorkoutDay].length} exercises</p>
      </Card>

      <Card onClick={() => onNavigate("fitness", "nutrition")}>
        <p className="card__title">Nutrition remaining today</p>
        <p className="card__main">
          {nutritionRemaining.calories >= 0 ? nutritionRemaining.calories : 0} cal
        </p>
        <p className="card__sub">{nutritionRemaining.protein >= 0 ? nutritionRemaining.protein : 0}g protein remaining</p>
      </Card>

      <Card onClick={() => onNavigate("scroll")}>
        <p className="card__title">Scroll time earned today</p>
        <p className="card__main">{scrollToday} min</p>
      </Card>
    </div>
  );
}
