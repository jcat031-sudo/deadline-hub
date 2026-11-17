import type { Deadline } from "../data/types";
import { useApp } from "../data/AppContext";
import { formatCountdown } from "../utils/date";
import { CheckIcon } from "./icons";

export default function DeadlineRow({
  deadline,
  now,
  courseColor,
  onTap,
}: {
  deadline: Deadline;
  now: Date;
  courseColor?: string;
  onTap: () => void;
}) {
  const { toggleDeadlineDone } = useApp();
  const due = new Date(deadline.due);
  const isOverdue = !deadline.done && due.getTime() < now.getTime();
  const isSoon = !deadline.done && !isOverdue && due.getTime() - now.getTime() <= 48 * 3600 * 1000;

  return (
    <div className="list-row">
      <button
        className={`checkbox${deadline.done ? " checkbox--checked" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleDeadlineDone(deadline.id);
        }}
        aria-label={deadline.done ? "Mark not done" : "Mark done"}
      >
        {deadline.done && <CheckIcon size={15} />}
      </button>
      <div className="list-row__main" onClick={onTap}>
        <p className={`list-row__title${deadline.done ? " list-row--done" : ""}`}>{deadline.title}</p>
        <div className="list-row__sub">
          {courseColor && <span className="course-dot" style={{ background: courseColor }} />}
          <span>{deadline.course}</span>
          <span>&middot;</span>
          <span>{deadline.type}</span>
        </div>
      </div>
      {!deadline.done && (
        <span className={`badge ${isOverdue ? "badge--red" : isSoon ? "badge--amber" : "badge--neutral"}`}>
          {formatCountdown(due, now)}
        </span>
      )}
    </div>
  );
}
