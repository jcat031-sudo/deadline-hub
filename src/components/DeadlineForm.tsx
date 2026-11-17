import { useState } from "react";
import type { Deadline, DeadlineType } from "../data/types";
import { useApp, type NewDeadlineInput } from "../data/AppContext";
import BottomSheet from "./BottomSheet";
import { TrashIcon } from "./icons";

const TYPES: DeadlineType[] = ["homework", "quiz", "lab report", "project", "midterm", "final", "other"];

function toLocalInputValue(iso: string): string {
  // Deadline.due is already stored as "YYYY-MM-DDTHH:MM"
  return iso.slice(0, 16);
}

export default function DeadlineForm({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Deadline | null;
}) {
  const { data, addDeadline, updateDeadline, deleteDeadline } = useApp();

  const [form, setForm] = useState<NewDeadlineInput>(() =>
    editing
      ? {
          course: editing.course,
          title: editing.title,
          type: editing.type,
          due: toLocalInputValue(editing.due),
          platform: editing.platform,
          notes: editing.notes,
        }
      : {
          course: data.courses[0]?.code ?? "",
          title: "",
          type: "homework",
          due: "",
          platform: "",
          notes: "",
        }
  );

  // Reset form when switching between add/edit or opening
  const key = editing?.id ?? "new";
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setForm(
      editing
        ? {
            course: editing.course,
            title: editing.title,
            type: editing.type,
            due: toLocalInputValue(editing.due),
            platform: editing.platform,
            notes: editing.notes,
          }
        : {
            course: data.courses[0]?.code ?? "",
            title: "",
            type: "homework",
            due: "",
            platform: "",
            notes: "",
          }
    );
  }

  const [error, setError] = useState("");

  function handleSave() {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.due) {
      setError("Due date is required");
      return;
    }
    if (editing) {
      updateDeadline(editing.id, form);
    } else {
      addDeadline(form);
    }
    onClose();
  }

  function handleDelete() {
    if (editing) {
      deleteDeadline(editing.id);
      onClose();
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? "Edit deadline" : "Add deadline"}>
      <div className="field">
        <label>Course</label>
        <input
          list="course-options"
          value={form.course}
          onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
          placeholder="e.g. ES 220"
        />
        <datalist id="course-options">
          {data.courses.map((c) => (
            <option key={c.id} value={c.code} />
          ))}
        </datalist>
      </div>

      <div className="field">
        <label>Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Problem Set 3"
        />
      </div>

      <div className="field">
        <label>Type</label>
        <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as DeadlineType }))}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Due</label>
        <input
          type="datetime-local"
          value={form.due}
          onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))}
        />
      </div>

      <div className="field">
        <label>Platform</label>
        <input
          value={form.platform}
          onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
          placeholder="e.g. Moodle, MyLab"
        />
      </div>

      <div className="field">
        <label>Notes</label>
        <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
      </div>

      {error && <p className="inline-error">{error}</p>}

      <button className="btn btn-primary btn-block" onClick={handleSave}>
        {editing ? "Save changes" : "Add deadline"}
      </button>

      {editing && (
        <button className="btn btn-danger btn-block" style={{ marginTop: 10 }} onClick={handleDelete}>
          <TrashIcon size={16} /> Delete
        </button>
      )}
    </BottomSheet>
  );
}
