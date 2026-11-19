import { useState } from "react";
import { useApp } from "../data/AppContext";
import Card from "../components/Card";
import SwipeToDelete from "../components/SwipeToDelete";
import MealForm from "../components/MealForm";
import AddNutritionEntrySheet from "../components/AddNutritionEntrySheet";
import BottomSheet from "../components/BottomSheet";
import ActivityRing from "../components/ActivityRing";
import { PlusIcon, ChevronRight } from "../components/icons";
import { toDateInputValue } from "../utils/date";
import { averageOverDays, remaining, totalsForDate } from "../utils/nutritionHelpers";
import type { Meal } from "../data/types";

function formatDayLabel(dateStr: string, today: string): string {
  if (dateStr === today) return "Today";
  const d = new Date(dateStr + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  const diffDays = Math.round((t.getTime() - d.getTime()) / 86400000);
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function addDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return toDateInputValue(d);
}

export default function Nutrition() {
  const { data, deleteNutritionLogEntry } = useApp();
  const today = toDateInputValue(new Date());
  const [date, setDate] = useState(today);
  const [addOpen, setAddOpen] = useState(false);
  const [mealsOpen, setMealsOpen] = useState(false);

  const targets = data.settings.nutritionTargets;
  const totals = totalsForDate(data.nutritionLog, date);
  const rem = remaining(targets, totals);
  const entries = data.nutritionLog.filter((e) => e.date === date).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const avg = averageOverDays(data.nutritionLog, new Date(date + "T00:00:00"), 7);

  const carbsPct = targets.carbs > 0 ? Math.min(1, totals.carbs / targets.carbs) : 0;
  const fatPct = targets.fat > 0 ? Math.min(1, totals.fat / targets.fat) : 0;

  return (
    <div>
      <div className="day-nav">
        <button className="icon-btn" onClick={() => setDate((d) => addDays(d, -1))} aria-label="Previous day">
          <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
            <ChevronRight size={18} />
          </span>
        </button>
        <span className="day-nav__label">{formatDayLabel(date, today)}</span>
        <button
          className="icon-btn"
          onClick={() => setDate((d) => addDays(d, 1))}
          disabled={date >= today}
          aria-label="Next day"
          style={date >= today ? { opacity: 0.3 } : undefined}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <Card>
        <div className="rings-row">
          <div className="ring-stat">
            <ActivityRing progress={totals.calories / Math.max(1, targets.calories)} color="var(--accent)" />
            <div className="ring-stat__label">
              <p className="ring-stat__value">{totals.calories}</p>
              <p className="ring-stat__unit">of {targets.calories}</p>
            </div>
          </div>
          <div className="ring-stat">
            <ActivityRing progress={totals.protein / Math.max(1, targets.protein)} color="#5e9eff" />
            <div className="ring-stat__label">
              <p className="ring-stat__value">{totals.protein}g</p>
              <p className="ring-stat__unit">of {targets.protein}g</p>
            </div>
          </div>
        </div>
        <p className="card__sub" style={{ textAlign: "center", marginBottom: 14 }}>
          {rem.calories >= 0 ? `${rem.calories} cal remaining` : `${Math.abs(rem.calories)} cal over`} &middot;{" "}
          {rem.protein >= 0 ? `${rem.protein}g protein remaining` : `${Math.abs(rem.protein)}g protein over`}
        </p>

        <div className="macro-bar-row">
          <div className="macro-bar-row__head">
            <span className="macro-bar-row__label">Carbs</span>
            <span className="macro-bar-row__amounts">
              {totals.carbs}g / {targets.carbs}g
            </span>
          </div>
          <div className="macro-bar-track">
            <div className="macro-bar-fill" style={{ width: `${carbsPct * 100}%`, background: "#ffb020" }} />
          </div>
        </div>
        <div className="macro-bar-row" style={{ marginBottom: 0 }}>
          <div className="macro-bar-row__head">
            <span className="macro-bar-row__label">Fat</span>
            <span className="macro-bar-row__amounts">
              {totals.fat}g / {targets.fat}g
            </span>
          </div>
          <div className="macro-bar-track">
            <div className="macro-bar-fill" style={{ width: `${fatPct * 100}%`, background: "#ff6b6b" }} />
          </div>
        </div>
      </Card>

      <div className="stat-tile-row">
        <div className="stat-tile">
          <p className="stat-tile__label">7-day avg cal</p>
          <p className="stat-tile__value">{avg.calories}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-tile__label">7-day avg protein</p>
          <p className="stat-tile__value">{avg.protein}g</p>
        </div>
      </div>

      <button className="settings-action" style={{ marginBottom: 16, textAlign: "left" }} onClick={() => setMealsOpen(true)}>
        Manage meals &rsaquo;
      </button>

      <h3 className="section-title" style={{ marginTop: 0 }}>
        Entries
      </h3>
      {entries.length === 0 && <p className="empty-state">Nothing logged {date === today ? "today" : "this day"} yet.</p>}
      {entries.length > 0 && (
        <div className="grouped-card">
          {entries.map((e) => (
            <SwipeToDelete key={e.id} onDelete={() => deleteNutritionLogEntry(e.id)}>
              <div className="list-row" style={{ padding: "12px 14px" }}>
                <div className="list-row__main">
                  <p className="list-row__title">{e.name}</p>
                  <p className="list-row__sub">
                    {e.calories} cal &middot; {e.protein}g P &middot; {e.carbs}g C &middot; {e.fat}g F
                    {e.servings !== 1 ? ` · ${e.servings}×` : ""}
                  </p>
                </div>
              </div>
            </SwipeToDelete>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => setAddOpen(true)} aria-label="Add food">
        <PlusIcon size={26} />
      </button>

      <AddNutritionEntrySheet open={addOpen} onClose={() => setAddOpen(false)} date={date} />
      <ManageMealsSheet open={mealsOpen} onClose={() => setMealsOpen(false)} />
    </div>
  );
}

function ManageMealsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, deleteMeal } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Meal | null>(null);

  return (
    <BottomSheet open={open} onClose={onClose} title="Manage meals">
      {data.meals.length === 0 && <p className="empty-state">No saved meals yet.</p>}
      {data.meals.length > 0 && (
        <div className="grouped-card" style={{ padding: "0 14px", marginBottom: 14 }}>
          {data.meals.map((m) => (
            <SwipeToDelete key={m.id} onDelete={() => deleteMeal(m.id)}>
              <button
                className="settings-row"
                style={{ width: "100%", background: "none", border: "none", font: "inherit", color: "inherit", cursor: "pointer" }}
                onClick={() => {
                  setEditing(m);
                  setFormOpen(true);
                }}
              >
                <span className="settings-row__label">{m.name}</span>
                <span className="card__sub">{m.calories} cal</span>
              </button>
            </SwipeToDelete>
          ))}
        </div>
      )}
      <button
        className="btn btn-secondary btn-block"
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
      >
        <PlusIcon size={16} /> Add meal
      </button>
      <MealForm open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />
    </BottomSheet>
  );
}
