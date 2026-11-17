import { useState } from "react";
import type { ClassMeeting, Course, DayCode } from "../data/types";
import { useApp } from "../data/AppContext";
import BottomSheet from "./BottomSheet";
import { TrashIcon, PlusIcon } from "./icons";
import { makeId } from "../utils/id";
import { DAY_ORDER } from "../utils/date";

function emptyMeeting(): ClassMeeting {
  return { id: makeId(), days: [], startTime: "09:00", endTime: "09:50", room: "" };
}

export default function CourseForm({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Course | null;
}) {
  const { addCourse, updateCourse, deleteCourse } = useApp();
  const [form, setForm] = useState<Omit<Course, "id">>(
    () =>
      editing ?? {
        code: "",
        name: "",
        instructor: "",
        color: "#00693e",
        meetings: [emptyMeeting()],
      }
  );
  const [key, setKey] = useState(editing?.id ?? "new");
  const nextKey = editing?.id ?? "new";
  if (nextKey !== key) {
    setKey(nextKey);
    setForm(editing ?? { code: "", name: "", instructor: "", color: "#00693e", meetings: [emptyMeeting()] });
  }

  function toggleDay(meetingId: string, day: DayCode) {
    setForm((f) => ({
      ...f,
      meetings: f.meetings.map((m) =>
        m.id === meetingId
          ? { ...m, days: m.days.includes(day) ? m.days.filter((d) => d !== day) : [...m.days, day] }
          : m
      ),
    }));
  }

  function patchMeeting(meetingId: string, patch: Partial<ClassMeeting>) {
    setForm((f) => ({
      ...f,
      meetings: f.meetings.map((m) => (m.id === meetingId ? { ...m, ...patch } : m)),
    }));
  }

  function save() {
    if (!form.code.trim()) return;
    if (editing) updateCourse(editing.id, form);
    else addCourse(form);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? "Edit course" : "Add course"}>
      <div className="field-row">
        <div className="field">
          <label>Code</label>
          <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="ES 220" />
        </div>
        <div className="field">
          <label>Color</label>
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
            style={{ padding: 2, minHeight: 44 }}
          />
        </div>
      </div>
      <div className="field">
        <label>Name</label>
        <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Statics" />
      </div>
      <div className="field">
        <label>Instructor</label>
        <input value={form.instructor} onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))} />
      </div>

      <p className="group-header" style={{ marginTop: 4 }}>
        Meeting times
      </p>
      {form.meetings.map((m) => (
        <div key={m.id} className="card" style={{ padding: 12 }}>
          <div className="chip-row" style={{ marginBottom: 8 }}>
            {DAY_ORDER.map((d) => (
              <button
                key={d}
                type="button"
                className={`chip${m.days.includes(d) ? " chip--active" : ""}`}
                onClick={() => toggleDay(m.id, d)}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="field-row">
            <div className="field">
              <label>Start</label>
              <input type="time" value={m.startTime} onChange={(e) => patchMeeting(m.id, { startTime: e.target.value })} />
            </div>
            <div className="field">
              <label>End</label>
              <input type="time" value={m.endTime} onChange={(e) => patchMeeting(m.id, { endTime: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Room</label>
            <input value={m.room} onChange={(e) => patchMeeting(m.id, { room: e.target.value })} />
          </div>
          <div className="field">
            <label>Label (optional)</label>
            <input
              value={m.label ?? ""}
              onChange={(e) => patchMeeting(m.id, { label: e.target.value })}
              placeholder="Lecture, Lab, Discussion"
            />
          </div>
          <button
            type="button"
            className="btn btn-danger btn-block"
            onClick={() => setForm((f) => ({ ...f, meetings: f.meetings.filter((x) => x.id !== m.id) }))}
          >
            <TrashIcon size={16} /> Remove meeting
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-secondary btn-block"
        onClick={() => setForm((f) => ({ ...f, meetings: [...f.meetings, emptyMeeting()] }))}
      >
        <PlusIcon size={16} /> Add meeting time
      </button>

      <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={save}>
        {editing ? "Save changes" : "Add course"}
      </button>
      {editing && (
        <button
          className="btn btn-danger btn-block"
          style={{ marginTop: 10 }}
          onClick={() => {
            deleteCourse(editing.id);
            onClose();
          }}
        >
          <TrashIcon size={16} /> Delete course
        </button>
      )}
    </BottomSheet>
  );
}
