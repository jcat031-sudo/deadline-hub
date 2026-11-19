import { useRef, useState } from "react";
import { useApp } from "../data/AppContext";
import { downloadTextFile } from "../utils/download";
import { toDateInputValue } from "../utils/date";
import CourseForm from "../components/CourseForm";
import { ChevronRight, PlusIcon, TrashIcon } from "../components/icons";
import type { Course, DeadlineType, NutritionTargets, WorkoutDay } from "../data/types";
import { makeId } from "../utils/id";

const DAYS: WorkoutDay[] = ["Push", "Pull", "Legs"];
const REWARD_TYPES: DeadlineType[] = ["homework", "quiz", "lab report", "project", "midterm", "final", "other"];
const NUTRITION_FIELDS: { key: keyof NutritionTargets; label: string }[] = [
  { key: "calories", label: "Calories" },
  { key: "protein", label: "Protein (g)" },
  { key: "carbs", label: "Carbs (g)" },
  { key: "fat", label: "Fat (g)" },
];

export default function Settings() {
  return (
    <div>
      <SemesterSettings />
      <CoursesSettings />
      <WorkoutProgramSettings />
      <NutritionTargetSettings />
      <RewardSettings />
      <BackupSettings />
      <DangerZone />
    </div>
  );
}

function NutritionTargetSettings() {
  const { data, updateSettings } = useApp();
  return (
    <div className="settings-group">
      <h3>Nutrition targets</h3>
      <div className="grouped-card">
        {NUTRITION_FIELDS.map(({ key, label }) => (
          <div className="settings-row" key={key}>
            <span className="settings-row__label">{label}</span>
            <input
              type="number"
              value={data.settings.nutritionTargets[key]}
              onChange={(e) =>
                updateSettings({
                  nutritionTargets: { ...data.settings.nutritionTargets, [key]: Number(e.target.value) },
                })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SemesterSettings() {
  const { data, updateSettings } = useApp();
  return (
    <div className="settings-group">
      <h3>Semester</h3>
      <div className="grouped-card">
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
      <div className="grouped-card">
        {data.courses.map((c) => (
          <button
            className="settings-row"
            key={c.id}
            onClick={() => {
              setEditing(c);
              setFormOpen(true);
            }}
            style={{ width: "100%", background: "none", border: "none", font: "inherit", color: "inherit", cursor: "pointer" }}
          >
            <span className="settings-row__label">
              <span className="course-dot" style={{ background: c.color, marginRight: 9 }} />
              {c.code} &mdash; {c.name}
            </span>
            <ChevronRight size={16} />
          </button>
        ))}
        <button
          className="settings-row settings-action"
          style={{ justifyContent: "flex-start" }}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <PlusIcon size={16} /> Add course
        </button>
      </div>
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
      <div className="grouped-card">
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
      <div className="grouped-card">
        <button className="settings-row settings-action" style={{ justifyContent: "flex-start" }} onClick={handleExport}>
          Export backup
        </button>
        <button
          className="settings-row settings-action"
          style={{ justifyContent: "flex-start" }}
          onClick={() => fileRef.current?.click()}
        >
          Import backup
        </button>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleImportFile} />
      {message && <p className="card__sub" style={{ margin: "8px 6px 0" }}>{message}</p>}
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
        <div className="grouped-card">
          <button
            className="settings-row settings-action settings-action--danger"
            style={{ justifyContent: "flex-start" }}
            onClick={() => setConfirming(true)}
          >
            Reset all data
          </button>
        </div>
      ) : (
        <>
          <p className="inline-error" style={{ margin: "0 6px 10px" }}>
            This deletes everything stored on this phone. This can&rsquo;t be undone.
          </p>
          <div className="grouped-card">
            <button
              className="settings-row settings-action settings-action--danger"
              style={{ justifyContent: "flex-start" }}
              onClick={() => {
                resetAll();
                setConfirming(false);
              }}
            >
              Yes, erase everything
            </button>
            <button
              className="settings-row settings-action"
              style={{ justifyContent: "flex-start", color: "var(--text)" }}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
