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
      <Card>
        <p className="card__title">Earned today</p>
        <p className="card__main" style={{ fontSize: 32 }}>
          {earnedToday} min
        </p>
      </Card>
      <Card>
        <p className="card__title">Earned this week</p>
        <p className="card__main" style={{ fontSize: 24 }}>
          {earnedWeek} min
        </p>
      </Card>

      <button className="btn btn-primary btn-block" onClick={() => runShortcut("Show Balance")}>
        Check balance
      </button>
      <p className="card__sub" style={{ textAlign: "center", marginTop: 8 }}>
        Opens the Shortcuts app to show your current minute balance.
      </p>

      <h3 className="section-title">Earning log</h3>
      {recent.length === 0 && <p className="empty-state">Finish an assignment to earn scroll time.</p>}
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
  );
}
