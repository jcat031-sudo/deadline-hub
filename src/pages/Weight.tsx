import { useState } from "react";
import { useApp } from "../data/AppContext";
import Card from "../components/Card";
import LineChart from "../components/LineChart";
import SwipeToDelete from "../components/SwipeToDelete";
import { toDateInputValue } from "../utils/date";
import {
  changeOverDays,
  filterByRange,
  movingAverageSeries,
  sortedByDate,
  weeklyRateOfChange,
  type WeightRange,
} from "../utils/weightHelpers";

const RANGES: WeightRange[] = ["1W", "1M", "3M", "All"];

function fmtChange(v: number | null): string {
  if (v === null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)} lb`;
}

export default function Weight() {
  const { data, upsertWeightEntry, deleteWeightEntry } = useApp();
  const [range, setRange] = useState<WeightRange>("1M");
  const today = toDateInputValue(new Date());
  const [logDate, setLogDate] = useState(today);
  const [logWeight, setLogWeight] = useState("");

  const sorted = sortedByDate(data.weightLog);
  const visible = filterByRange(data.weightLog, range);
  const movingAvg = movingAverageSeries(data.weightLog, visible);

  const current = sorted[sorted.length - 1] ?? null;
  const change7 = changeOverDays(data.weightLog, 7);
  const change30 = changeOverDays(data.weightLog, 30);
  const rate = weeklyRateOfChange(visible.length >= 2 ? visible : sorted);

  const weightSeries = visible.map((e) => ({ x: new Date(e.date).getTime(), y: e.weight }));
  const avgSeries = movingAvg.map((p) => ({ x: new Date(p.date).getTime(), y: p.value }));

  const history = [...sorted].reverse();

  function submitLog() {
    const w = Number(logWeight);
    if (!w || w <= 0) return;
    upsertWeightEntry(logDate, w);
    setLogWeight("");
  }

  return (
    <div>
      <div className="stat-tile-row">
        <div className="stat-tile">
          <p className="stat-tile__label">Current</p>
          <p className="stat-tile__value">{current ? `${current.weight} lb` : "—"}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">7-day change</p>
          <p className="stat-tile__value">{fmtChange(change7)}</p>
        </div>
      </div>
      <div className="stat-tile-row">
        <div className="stat-tile">
          <p className="stat-tile__label">30-day change</p>
          <p className="stat-tile__value">{fmtChange(change30)}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">Weekly rate</p>
          <p className="stat-tile__value">{fmtChange(rate)}</p>
        </div>
      </div>

      <div className="range-pills">
        {RANGES.map((r) => (
          <button key={r} className={`range-pill${range === r ? " range-pill--active" : ""}`} onClick={() => setRange(r)}>
            {r}
          </button>
        ))}
      </div>

      <Card>
        <LineChart
          series={[
            { label: "Weight", color: "var(--accent)", points: weightSeries, area: true },
            { label: "7-day avg", color: "#9ca3af", points: avgSeries, dashed: true },
          ]}
          formatX={(x) => new Date(x).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          formatY={(y) => `${Math.round(y * 10) / 10} lb`}
        />
      </Card>

      <Card>
        <p className="card__title">Log weight</p>
        <div className="field-row" style={{ alignItems: "flex-end" }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Weight (lb)</label>
            <input type="number" inputMode="decimal" value={logWeight} onChange={(e) => setLogWeight(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Date</label>
            <input type="date" value={logDate} max={today} onChange={(e) => setLogDate(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={submitLog} disabled={!logWeight}>
          Log
        </button>
      </Card>

      <h3 className="section-title">History</h3>
      {history.length === 0 && <p className="empty-state">No weigh-ins logged yet.</p>}
      {history.length > 0 && (
        <div className="grouped-card">
          {history.map((e) => (
            <SwipeToDelete key={e.id} onDelete={() => deleteWeightEntry(e.id)}>
              <div className="list-row" style={{ padding: "12px 14px" }}>
                <div className="list-row__main">
                  <p className="list-row__title">{e.weight} lb</p>
                  <p className="list-row__sub">
                    {new Date(e.date + "T00:00:00").toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </SwipeToDelete>
          ))}
        </div>
      )}
    </div>
  );
}
