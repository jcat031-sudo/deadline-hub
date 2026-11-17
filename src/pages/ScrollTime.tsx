import { useApp } from "../data/AppContext";
import Card from "../components/Card";
import { toDateInputValue } from "../utils/date";

function runShortcut(name: string) {
  window.location.href = `shortcuts://run-shortcut?name=${encodeURIComponent(name)}`;
}

export default function ScrollTime() {
  const { data } = useApp();

  const today = toDateInputValue(new Date());
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
  const weekStr = toDateInputValue(startOfWeek);

  const earnedToday = data.scrollLog.filter((e) => e.date === today).reduce((s, e) => s + e.minutes, 0);
  const earnedWeek = data.scrollLog.filter((e) => e.date >= weekStr).reduce((s, e) => s + e.minutes, 0);

  const recent = [...data.scrollLog].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 15);

  return (
    <div>
      <div style={{ display: "flex", gap: 12 }}>
        <Card className="stat-card">
          <p className="card__title">Today</p>
          <p className="stat-number">{earnedToday}</p>
          <p className="card__sub">minutes</p>
        </Card>
        <Card className="stat-card">
          <p className="card__title">This week</p>
          <p className="stat-number">{earnedWeek}</p>
          <p className="card__sub">minutes</p>
        </Card>
      </div>

      <button className="btn btn-primary btn-block" onClick={() => runShortcut("Show Balance")}>
        Check balance
      </button>
      <p className="card__sub" style={{ textAlign: "center", margin: "8px 6px 0" }}>
        Opens the Shortcuts app to show your current minute balance.
      </p>

      <h3 className="section-title">Earning log</h3>
      {recent.length === 0 && <p className="empty-state">Finish an assignment to earn scroll time.</p>}
      {recent.length > 0 && (
        <div className="grouped-card" style={{ padding: "0 14px" }}>
          {recent.map((e) => (
            <div className="list-row" key={e.id}>
              <div className="list-row__main">
                <p className="list-row__title">{e.source}</p>
                <p className="list-row__sub">{e.date}</p>
              </div>
              <span className="badge badge--accent">+{e.minutes} min</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
