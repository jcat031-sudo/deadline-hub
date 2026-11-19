import { useState } from "react";
import { useApp } from "../data/AppContext";
import BottomSheet from "./BottomSheet";
import SegmentedControl from "./SegmentedControl";

export default function AddNutritionEntrySheet({
  open,
  onClose,
  date,
}: {
  open: boolean;
  onClose: () => void;
  date: string;
}) {
  const { data, logMealToDate, quickAddNutritionEntry } = useApp();
  const [mode, setMode] = useState<"library" | "quick">("library");
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [servings, setServings] = useState("1");

  const [quick, setQuick] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  const [saveAsMeal, setSaveAsMeal] = useState(false);

  function reset() {
    setMode("library");
    setSelectedMealId(null);
    setServings("1");
    setQuick({ name: "", calories: "", protein: "", carbs: "", fat: "" });
    setSaveAsMeal(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function confirmLibrary() {
    if (!selectedMealId) return;
    const n = Number(servings) || 1;
    logMealToDate(selectedMealId, n, date);
    handleClose();
  }

  function confirmQuick() {
    if (!quick.name.trim()) return;
    quickAddNutritionEntry(
      {
        name: quick.name,
        calories: Number(quick.calories) || 0,
        protein: Number(quick.protein) || 0,
        carbs: Number(quick.carbs) || 0,
        fat: Number(quick.fat) || 0,
        date,
      },
      saveAsMeal
    );
    handleClose();
  }

  const selectedMeal = data.meals.find((m) => m.id === selectedMealId);

  return (
    <BottomSheet open={open} onClose={handleClose} title="Add food">
      <SegmentedControl
        value={mode}
        onChange={(v) => {
          setMode(v);
          setSelectedMealId(null);
        }}
        options={[
          { value: "library", label: "From library" },
          { value: "quick", label: "Quick add" },
        ]}
      />

      {mode === "library" && (
        <div>
          {data.meals.length === 0 && (
            <p className="empty-state">No saved meals yet. Switch to Quick add, or save meals from Manage Meals.</p>
          )}
          <div className="grouped-card" style={{ padding: "0 14px", marginBottom: 14 }}>
            {data.meals.map((m) => (
              <button
                key={m.id}
                className="settings-row"
                style={{ width: "100%", background: "none", border: "none", font: "inherit", color: "inherit", cursor: "pointer" }}
                onClick={() => setSelectedMealId(m.id)}
              >
                <span className="settings-row__label">{m.name}</span>
                <span className="card__sub">{m.calories} cal</span>
              </button>
            ))}
          </div>

          {selectedMeal && (
            <>
              <div className="field">
                <label>Servings</label>
                <input type="number" step="0.5" min="0.5" value={servings} onChange={(e) => setServings(e.target.value)} />
              </div>
              <p className="card__sub" style={{ marginBottom: 14 }}>
                {Math.round(selectedMeal.calories * (Number(servings) || 0))} cal &middot;{" "}
                {Math.round(selectedMeal.protein * (Number(servings) || 0))}g protein &middot;{" "}
                {Math.round(selectedMeal.carbs * (Number(servings) || 0))}g carbs &middot;{" "}
                {Math.round(selectedMeal.fat * (Number(servings) || 0))}g fat
              </p>
              <button className="btn btn-primary btn-block" onClick={confirmLibrary}>
                Add {selectedMeal.name}
              </button>
            </>
          )}
        </div>
      )}

      {mode === "quick" && (
        <div>
          <div className="field">
            <label>Name</label>
            <input value={quick.name} onChange={(e) => setQuick((q) => ({ ...q, name: e.target.value }))} placeholder="e.g. Protein bar" />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Calories</label>
              <input
                type="number"
                value={quick.calories}
                onChange={(e) => setQuick((q) => ({ ...q, calories: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Protein (g)</label>
              <input
                type="number"
                value={quick.protein}
                onChange={(e) => setQuick((q) => ({ ...q, protein: e.target.value }))}
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Carbs (g)</label>
              <input type="number" value={quick.carbs} onChange={(e) => setQuick((q) => ({ ...q, carbs: e.target.value }))} />
            </div>
            <div className="field">
              <label>Fat (g)</label>
              <input type="number" value={quick.fat} onChange={(e) => setQuick((q) => ({ ...q, fat: e.target.value }))} />
            </div>
          </div>
          <label className="list-row" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={saveAsMeal}
              onChange={(e) => setSaveAsMeal(e.target.checked)}
              style={{ width: 22, height: 22, accentColor: "var(--accent)" }}
            />
            <span className="list-row__main">Save as a meal for next time</span>
          </label>
          <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={confirmQuick}>
            Add entry
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
