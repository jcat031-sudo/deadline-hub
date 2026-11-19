import { useMemo, useState } from "react";
import { useApp } from "../data/AppContext";
import SegmentedControl from "../components/SegmentedControl";
import Chip from "../components/Chip";
import Card from "../components/Card";
import RestTimer from "../components/RestTimer";
import LineChart from "../components/LineChart";
import { CheckIcon } from "../components/icons";
import type { ExerciseDef, SetLog, WorkoutDay, WorkoutSession } from "../data/types";
import { emptySetsFor, lastLoggedSets, shouldProgress } from "../utils/workoutHelpers";
import { estimate1RM } from "../utils/epley";
import { makeId } from "../utils/id";

const DAYS: WorkoutDay[] = ["Push", "Pull", "Legs"];

export default function Gym() {
  const [segment, setSegment] = useState<"workout" | "growth">("workout");
  return (
    <div>
      <SegmentedControl
        value={segment}
        onChange={setSegment}
        options={[
          { value: "workout", label: "Workout" },
          { value: "growth", label: "Growth" },
        ]}
      />
      {segment === "workout" ? <WorkoutSection /> : <GrowthSection />}
    </div>
  );
}

function WorkoutSection() {
  const { data, updateWorkoutSession, finishWorkoutSession, setNextWorkoutDay } = useApp();
  const activeSession = data.workoutSessions.find((s) => !s.finishedAt) ?? null;
  const [rest, setRest] = useState<{ seconds: number; key: number } | null>(null);

  if (!activeSession) {
    const day = data.settings.nextWorkoutDay;
    const exercises = data.workoutProgram[day];
    return (
      <div>
        <Card>
          <p className="card__title">Up next</p>
          <p className="card__main">{day} day</p>
          <p className="card__sub">{exercises.map((e) => e.name).join(", ")}</p>
        </Card>

        <div className="chip-row">
          {DAYS.map((d) => (
            <Chip key={d} label={d} active={d === day} onClick={() => setNextWorkoutDay(d)} />
          ))}
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={() => {
            const session: WorkoutSession = {
              id: makeId(),
              day,
              date: new Date().toISOString(),
              exercises: exercises.map((def) => ({
                exerciseId: def.id,
                name: def.name,
                sets: emptySetsFor(def, lastLoggedSets(data.workoutSessions, def.id)),
              })),
            };
            updateWorkoutSession(session);
          }}
        >
          Start workout
        </button>
      </div>
    );
  }

  const program = data.workoutProgram[activeSession.day];

  function setSet(exIdx: number, setIdx: number, patch: Partial<SetLog>) {
    const updated: WorkoutSession = {
      ...activeSession!,
      exercises: activeSession!.exercises.map((e, i) =>
        i === exIdx ? { ...e, sets: e.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) } : e
      ),
    };
    updateWorkoutSession(updated);
  }

  function checkSet(exIdx: number) {
    const restSeconds = exIdx < 2 ? 150 : 75;
    setRest({ seconds: restSeconds, key: Date.now() });
  }

  return (
    <div>
      <div className="card__row" style={{ marginBottom: 10 }}>
        <p className="section-title" style={{ margin: 0 }}>
          {activeSession.day} day
        </p>
      </div>

      {program.map((def, exIdx) => {
        const log = activeSession.exercises.find((e) => e.exerciseId === def.id);
        const sets = log?.sets ?? emptySetsFor(def, null);
        const last = lastLoggedSets(data.workoutSessions, def.id, activeSession.id);
        const flag = shouldProgress(def, last);

        return (
          <div className="exercise-block" key={def.id}>
            <div className="exercise-block__header">
              <div>
                <p className="exercise-block__name">{def.name}</p>
                <p className="exercise-block__range">
                  {def.sets} &times; {def.repRangeLow}&ndash;{def.repRangeHigh}
                  {def.backOff && ` + 1 × ${def.backOff.repLow}–${def.backOff.repHigh}`}
                </p>
                {flag && (
                  <span className="progression-flag">Go up: +{def.progressionIncrement} lb</span>
                )}
              </div>
            </div>

            {sets.map((set, setIdx) => {
              const isBackOff = def.backOff && setIdx === def.sets;
              return (
                <div className="set-row" key={setIdx}>
                  <span className="set-row__num">{isBackOff ? "B" : setIdx + 1}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="lb"
                    value={set.weight || ""}
                    onChange={(e) => setSet(exIdx, setIdx, { weight: Number(e.target.value) })}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="reps"
                    value={set.reps || ""}
                    onChange={(e) => setSet(exIdx, setIdx, { reps: Number(e.target.value) })}
                  />
                  <button
                    className={`set-check${set.reps > 0 ? " set-check--done" : ""}`}
                    onClick={() => checkSet(exIdx)}
                    aria-label="Log set"
                  >
                    <CheckIcon size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}

      <button
        className="btn btn-primary btn-block"
        onClick={() => finishWorkoutSession(activeSession)}
        style={{ marginBottom: 20 }}
      >
        Finish workout
      </button>

      {rest && <RestTimer key={rest.key} seconds={rest.seconds} onDone={() => setRest(null)} />}
    </div>
  );
}

function GrowthSection() {
  const { data } = useApp();
  const allDefs = useMemo(() => {
    const seen = new Map<string, ExerciseDef>();
    for (const day of DAYS) {
      for (const def of data.workoutProgram[day]) seen.set(def.id, def);
    }
    return Array.from(seen.values());
  }, [data.workoutProgram]);

  const [selected, setSelected] = useState<string>(allDefs[0]?.id ?? "");
  const def = allDefs.find((d) => d.id === selected) ?? allDefs[0];

  const finished = data.workoutSessions
    .filter((s) => s.finishedAt)
    .sort((a, b) => new Date(a.finishedAt!).getTime() - new Date(b.finishedAt!).getTime());

  const history = def
    ? finished
        .map((s) => {
          const log = s.exercises.find((e) => e.exerciseId === def.id);
          if (!log || log.sets.length === 0) return null;
          const mainSets = log.sets.slice(0, def.sets).filter((s) => s.weight > 0 && s.reps > 0);
          if (mainSets.length === 0) return null;
          const top = mainSets.reduce((best, s) => (estimate1RM(s.weight, s.reps) > estimate1RM(best.weight, best.reps) ? s : best));
          return {
            date: new Date(s.finishedAt!),
            weight: top.weight,
            est1RM: estimate1RM(top.weight, top.reps),
          };
        })
        .filter((x): x is { date: Date; weight: number; est1RM: number } => x !== null)
    : [];

  let maxWeight = 0;
  let max1RM = 0;
  const withPR = history.map((h) => {
    const isWeightPR = h.weight > maxWeight;
    const is1RMPR = h.est1RM > max1RM;
    maxWeight = Math.max(maxWeight, h.weight);
    max1RM = Math.max(max1RM, h.est1RM);
    return { ...h, isPR: isWeightPR || is1RMPR };
  });

  const weightSeries = history.map((h) => ({ x: h.date.getTime(), y: h.weight }));
  const rmSeries = history.map((h) => ({ x: h.date.getTime(), y: h.est1RM }));

  return (
    <div>
      <div className="chip-row">
        {allDefs.map((d) => (
          <Chip key={d.id} label={d.name} active={d.id === selected} onClick={() => setSelected(d.id)} />
        ))}
      </div>

      {def && (
        <>
          <Card>
            <p className="card__title">{def.name} &mdash; top set</p>
            <LineChart
              series={[
                { label: "Weight", color: "var(--accent)", points: weightSeries, area: true },
                { label: "Est. 1RM", color: "#9ca3af", points: rmSeries, dashed: true },
              ]}
              formatX={(x) => new Date(x).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              formatY={(y) => `${Math.round(y)} lb`}
            />
            <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 12 }}>
              <span>
                <span style={{ color: "var(--accent)" }}>&#9679;</span> Weight
              </span>
              <span>
                <span style={{ color: "#9ca3af" }}>&#9679;</span> Est. 1RM
              </span>
            </div>
          </Card>

          <h3 className="section-title">Past workouts</h3>
          {withPR.length === 0 && <p className="empty-state">No logged sessions for this exercise yet.</p>}
          {[...withPR].reverse().map((h, i) => (
            <div className="list-row" key={i}>
              <div className="list-row__main">
                <p className="list-row__title">
                  {h.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </p>
                <p className="list-row__sub">
                  {h.weight} lb &times; top set &middot; est. 1RM {h.est1RM} lb
                </p>
              </div>
              {h.isPR && <span className="pr-badge">PR</span>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
