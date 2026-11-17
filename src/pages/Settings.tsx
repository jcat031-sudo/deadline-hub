import { useRef, useState } from "react";
import { useApp } from "../data/AppContext";
import { downloadTextFile } from "../utils/download";
import { toDateInputValue } from "../utils/date";
import CourseForm from "../components/CourseForm";
import { PlusIcon, TrashIcon } from "../components/icons";
import type { Course, DeadlineType, WorkoutDay } from "../data/types";
import { makeId } from "../utils/id";

const DAYS: WorkoutDay[] = ["Push", "Pull", "Legs"];
const REWARD_TYPES: DeadlineType[] = ["homework", "quiz", "lab report", "project", "midterm", "final", "other"];

export default function Settings() {
  return (
    <div>
      <SemesterSettings />
      <CoursesSettings />
      <WorkoutProgramSettings />
      <RewardSettings />
      <BackupSettings />
      <DangerZone />
    </div>
  );
}

function SemesterSettings() {
  const { data, updateSettings } = useApp();
  return (
    <div className="settings-group">
      <h3>Semester</h3>
      <div className="settings-row">
        <span className="settings-row__label">Start date</span>
        <input
          type="date"
          value={data.settings.semesterStart}
          onChange={(e) => updateSettings({ semesterStart: e.target.value })}
        />
      </div>
      <div className="settings-row">
        <span className="settings-row__label">End date</span>
        <input
          type="date"
          value={data.settings.semesterEnd}
          onChange={(e) => updateSettings({ semesterEnd: e.target.value })}
        />
      </div>
    </div>
  );
}

function CoursesSettings() {
  const { data } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  return (
    <div className="settings-group">
      <h3>Courses</h3>
      {data.courses.map((c) => (
        <div
          className="settings-row"
          key={c.id}
          onClick={() => {
            setEditing(c);
            setFormOpen(true);
          }}
          style={{ cursor: "pointer" }}
        >
          <span className="settings-row__label">
            <span className="course-dot" style={{ background: c.color, marginRight: 8 }} />
            {c.code} &mdash; {c.name}
          </span>
        </div>
      ))}
      <button
        className="btn btn-secondary btn-block"
        style={{ marginTop: 10 }}
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
      >
        <PlusIcon size={16} /> Add course
      </button>
      <CourseForm open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />
    </div>
  );
}

function WorkoutProgramSettings() {
  const { data, updateWorkoutProgram } = useApp();
  const [day, setDay] = useState<WorkoutDay>("Push");
  const exercises = data.workoutProgram[day];

  function patchExercise(id: string, patch: Partial<(typeof exercises)[number]>) {
    updateWorkoutProgram({
      ...data.workoutProgram,
      [day]: exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    });
  }

  function removeExercise(id: string) {
    updateWorkoutProgram({ ...data.workoutProgram, [day]: exercises.filter((e) => e.id !== id) });
  }

  function addExercise() {
    updateWorkoutProgram({
      ...data.workoutProgram,
      [day]: [
        ...exercises,
        { id: makeId(), name: "New exercise", sets: 3, repRangeLow: 8, repRangeHigh: 12, progressionIncrement: 5 },
      ],
    });
  }

  return (
    <div className="settings-group">
      <h3>Workout program</h3>
      <div className="chip-row">
        {DAYS.map((d) => (
          <button key={d} className={`chip${day === d ? " chip--active" : ""}`} onClick={() => setDay(d)}>
            {d}
          </button>
        ))}
      </div>
      {exercises.map((ex) => (
        <div key={ex.id} className="card" style={{ padding: 12 }}>
          <div className="field">
            <label>Name</label>
            <input value={ex.name} onChange={(e) => patchExercise(ex.id, { name: e.target.value })} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Sets</label>
              <input
                type="number"
                value={ex.sets}
                onChange={(e) => patchExercise(ex.id, { sets: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Reps low</label>
              <input
                type="number"
                value={ex.repRangeLow}
                onChange={(e) => patchExercise(ex.id, { repRangeLow: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Reps high</label>
              <input
                type="number"
                value={ex.repRangeHigh}
                onChange={(e) => patchExercise(ex.id, { repRangeHigh: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="field">
            <label>Progression (+lb)</label>
            <input
              type="number"
              value={ex.progressionIncrement}
              onChange={(e) => patchExercise(ex.id, { progressionIncrement: Number(e.target.value) })}
            />
          </div>
          <button className="btn btn-danger btn-block" onClick={() => removeExercise(ex.id)}>
            <TrashIcon size={16} /> Remove
          </button>
        </div>
      ))}
      <button className="btn btn-secondary btn-block" onClick={addExercise}>
        <PlusIcon size={16} /> Add exercise to {day}
      </button>
    </div>
  );
}

function RewardSettings() {
  const { data, updateSettings } = useApp();
  return (
    <div className="settings-group">
      <h3>Scroll time rewards (minutes)</h3>
      {REWARD_TYPES.map((t) => (
        <div className="settings-row" key={t}>
          <span className="settings-row__label" style={{ textTransform: "capitalize" }}>
            {t}
          </span>
          <input
            type="number"
            value={data.settings.rewardMinutes[t]}
            onChange={(e) =>
              updateSettings({
                rewardMinutes: { ...data.settings.rewardMinutes, [t]: Number(e.target.value) },
              })
            }
          />
        </div>
      ))}
    </div>
  );
}

function BackupSettings() {
  const { exportBackupString, importBackupString } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  function handleExport() {
    const json = exportBackupString();
    downloadTextFile(`deadline-hub-backup-${toDateInputValue(new Date())}.json`, json);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importBackupString(String(reader.result ?? ""));
        setMessage("Backup restored.");
      } catch {
        setMessage("That file couldn't be read as a backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="settings-group">
      <h3>Backup</h3>
      <button className="btn btn-secondary btn-block" onClick={handleExport}>
        Export backup
      </button>
      <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={() => fileRef.current?.click()}>
        Import backup
      </button>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleImportFile} />
      {message && <p className="card__sub" style={{ marginTop: 8 }}>{message}</p>}
    </div>
  );
}

function DangerZone() {
  const { resetAll } = useApp();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="settings-group">
      <h3>Reset</h3>
      {!confirming ? (
        <button className="btn btn-danger btn-block" onClick={() => setConfirming(true)}>
          Reset all data
        </button>
      ) : (
        <>
          <p className="inline-error">This deletes everything stored on this phone. This can't be undone.</p>
          <button
            className="btn btn-danger btn-block"
            onClick={() => {
              resetAll();
              setConfirming(false);
            }}
          >
            Yes, erase everything
          </button>
          <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={() => setConfirming(false)}>
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
