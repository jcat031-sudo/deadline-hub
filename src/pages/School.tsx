import { useMemo, useState } from "react";
import { useApp } from "../data/AppContext";
import { useNow } from "../hooks/useNow";
import SegmentedControl from "../components/SegmentedControl";
import Chip from "../components/Chip";
import Card from "../components/Card";
import DeadlineRow from "../components/DeadlineRow";
import DeadlineForm from "../components/DeadlineForm";
import ImportDialog from "../components/ImportDialog";
import { PlusIcon } from "../components/icons";
import { meetingsOnDate, weeklyGrid } from "../utils/schedule";
import { dayLabel, formatCountdown, formatTimeRange } from "../utils/date";
import { groupDeadlines } from "../utils/deadlineGroups";
import type { Deadline } from "../data/types";

type Section = "schedule" | "deadlines" | "exams";

export default function School() {
  const [section, setSection] = useState<Section>("schedule");

  return (
    <div>
      <SegmentedControl
        value={section}
        onChange={setSection}
        options={[
          { value: "schedule", label: "Schedule" },
          { value: "deadlines", label: "Deadlines" },
          { value: "exams", label: "Exams" },
        ]}
      />
      {section === "schedule" && <ScheduleSection />}
      {section === "deadlines" && <DeadlinesSection />}
      {section === "exams" && <ExamsSection />}
    </div>
  );
}

function ScheduleSection() {
  const { data } = useApp();
  const now = useNow();
  const todays = meetingsOnDate(data.courses, data.settings, now);
  const grid = useMemo(() => weeklyGrid(data.courses), [data.courses]);

  return (
    <div>
      <h3 className="section-title" style={{ marginTop: 0 }}>
        Today
      </h3>
      {todays.length === 0 ? (
        <p className="empty-state">No classes today</p>
      ) : (
        todays.map((inst) => (
          <Card key={inst.meeting.id} accent={inst.course.color}>
            <div className="card__row">
              <p className="card__main">{inst.course.code}</p>
              {now >= inst.start && now <= inst.end && <span className="badge badge--accent">Now</span>}
            </div>
            <p className="card__sub">
              {formatTimeRange(inst.meeting.startTime, inst.meeting.endTime)} &middot; {inst.meeting.room}
              {inst.meeting.label ? ` · ${inst.meeting.label}` : ""}
            </p>
          </Card>
        ))
      )}

      <h3 className="section-title">This week</h3>
      {(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const).map((day) => {
        const items = grid[day];
        if (items.length === 0) return null;
        return (
          <div key={day} style={{ marginBottom: 14 }}>
            <p className="group-header" style={{ marginTop: 10 }}>
              {dayLabel(day)}
            </p>
            {items.map(({ course, meeting }) => (
              <div className="list-row" key={meeting.id}>
                <span className="course-dot" style={{ background: course.color }} />
                <div className="list-row__main">
                  <p className="list-row__title">{course.code}</p>
                  <p className="list-row__sub">
                    {formatTimeRange(meeting.startTime, meeting.endTime)} &middot; {meeting.room}
                    {meeting.label ? ` · ${meeting.label}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function DeadlinesSection() {
  const { data } = useApp();
  const now = useNow();
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Deadline | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);

  const filtered = data.deadlines.filter((d) => !courseFilter || d.course === courseFilter);
  const groups = groupDeadlines(filtered, now);

  const courseCodes = Array.from(new Set(data.deadlines.map((d) => d.course)));

  function openEdit(d: Deadline) {
    setEditing(d);
    setFormOpen(true);
  }

  function colorFor(code: string) {
    return data.courses.find((c) => c.code === code)?.color;
  }

  return (
    <div>
      <div className="chip-row">
        <Chip label="All" active={courseFilter === null} onClick={() => setCourseFilter(null)} />
        {courseCodes.map((code) => (
          <Chip
            key={code}
            label={code}
            active={courseFilter === code}
            onClick={() => setCourseFilter(code)}
            color={colorFor(code)}
          />
        ))}
      </div>

      <button className="btn btn-secondary btn-block" onClick={() => setImportOpen(true)}>
        Import deadlines
      </button>

      <GroupBlock title="Overdue" items={groups.overdue} now={now} colorFor={colorFor} onTap={openEdit} />
      <GroupBlock title="Next 7 days" items={groups.next7} now={now} colorFor={colorFor} onTap={openEdit} />
      <GroupBlock title="Later" items={groups.later} now={now} colorFor={colorFor} onTap={openEdit} />

      <p className="group-header" onClick={() => setDoneOpen((o) => !o)}>
        Done ({groups.done.length}) {doneOpen ? "−" : "+"}
      </p>
      {doneOpen && <GroupBlock title="" items={groups.done} now={now} colorFor={colorFor} onTap={openEdit} hideTitle />}

      {data.deadlines.length === 0 && (
        <p className="empty-state">No deadlines yet. Add one or import your syllabus.</p>
      )}

      <button
        className="fab"
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        aria-label="Add deadline"
      >
        <PlusIcon size={26} />
      </button>

      <DeadlineForm open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}

function GroupBlock({
  title,
  items,
  now,
  colorFor,
  onTap,
  hideTitle,
}: {
  title: string;
  items: Deadline[];
  now: Date;
  colorFor: (code: string) => string | undefined;
  onTap: (d: Deadline) => void;
  hideTitle?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      {!hideTitle && <p className="group-header">{title}</p>}
      <div className="card" style={{ padding: "0 12px" }}>
        {items.map((d) => (
          <DeadlineRow key={d.id} deadline={d} now={now} courseColor={colorFor(d.course)} onTap={() => onTap(d)} />
        ))}
      </div>
    </div>
  );
}

function ExamsSection() {
  const { data } = useApp();
  const now = useNow();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Deadline | null>(null);

  const exams = data.deadlines
    .filter((d) => d.type === "midterm" || d.type === "final")
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

  function colorFor(code: string) {
    return data.courses.find((c) => c.code === code)?.color;
  }

  return (
    <div>
      {exams.length === 0 && <p className="empty-state">No exams added yet. Add one from Deadlines or import your syllabus.</p>}
      {exams.map((exam) => (
        <Card
          key={exam.id}
          accent={colorFor(exam.course)}
          onClick={() => {
            setEditing(exam);
            setFormOpen(true);
          }}
        >
          <div className="card__row">
            <p className="card__title">
              {exam.course} &middot; {exam.type}
            </p>
            {exam.done && <span className="badge badge--neutral">Done</span>}
          </div>
          <p className="card__main">{exam.title}</p>
          <p className="card__sub" style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>
            {formatCountdown(new Date(exam.due), now)}
          </p>
        </Card>
      ))}
      <DeadlineForm open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />
    </div>
  );
}
