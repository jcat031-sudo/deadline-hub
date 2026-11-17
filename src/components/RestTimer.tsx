import { useEffect, useRef, useState } from "react";

export default function RestTimer({
  seconds,
  onDone,
}: {
  seconds: number;
  onDone: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onDoneRef.current();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const pct = Math.max(0, Math.min(100, (remaining / seconds) * 100));

  return (
    <div className="rest-timer">
      <div className="rest-timer__bar" style={{ width: `${pct}%` }} />
      <div className="rest-timer__content">
        <span>{"Resting…"}</span>
        <span className="rest-timer__time">
          {mm}:{String(ss).padStart(2, "0")}
        </span>
        <button className="rest-timer__skip" onClick={() => setRemaining(0)}>
          Skip
        </button>
      </div>
    </div>
  );
}
