import { useState } from "react";
import type { Meal } from "../data/types";
import { useApp } from "../data/AppContext";
import BottomSheet from "./BottomSheet";
import { TrashIcon } from "./icons";

type MealInput = Omit<Meal, "id">;

function emptyMeal(): MealInput {
  return { name: "", calories: 0, protein: 0, carbs: 0, fat: 0, servingNote: "" };
}

export default function MealForm({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Meal | null;
}) {
  const { addMeal, updateMeal, deleteMeal } = useApp();
  const [form, setForm] = useState<MealInput>(() => (editing ? { ...editing } : emptyMeal()));
  const [key, setKey] = useState(editing?.id ?? "new");
  const nextKey = editing?.id ?? "new";
  if (nextKey !== key) {
    setKey(nextKey);
    setForm(editing ? { ...editing } : emptyMeal());
  }
  const [error, setError] = useState("");

  function save() {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (editing) updateMeal(editing.id, form);
    else addMeal(form);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? "Edit meal" : "Add meal"}>
      <div className="field">
        <label>Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Chicken & rice bowl"
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label>Calories</label>
          <input
            type="number"
            value={form.calories || ""}
            onChange={(e) => setForm((f) => ({ ...f, calories: Number(e.target.value) }))}
          />
        </div>
        <div className="field">
          <label>Protein (g)</label>
          <input
            type="number"
            value={form.protein || ""}
            onChange={(e) => setForm((f) => ({ ...f, protein: Number(e.target.value) }))}
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Carbs (g)</label>
          <input
            type="number"
            value={form.carbs || ""}
            onChange={(e) => setForm((f) => ({ ...f, carbs: Number(e.target.value) }))}
          />
        </div>
        <div className="field">
          <label>Fat (g)</label>
          <input
            type="number"
            value={form.fat || ""}
            onChange={(e) => setForm((f) => ({ ...f, fat: Number(e.target.value) }))}
          />
        </div>
      </div>
      <div className="field">
        <label>Serving note (optional)</label>
        <input
          value={form.servingNote ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, servingNote: e.target.value }))}
          placeholder="e.g. 1 bowl, 1 scoop"
        />
      </div>

      {error && <p className="inline-error">{error}</p>}

      <button className="btn btn-primary btn-block" onClick={save}>
        {editing ? "Save changes" : "Add meal"}
      </button>
      {editing && (
        <button
          className="btn btn-danger btn-block"
          style={{ marginTop: 10 }}
          onClick={() => {
            deleteMeal(editing.id);
            onClose();
          }}
        >
          <TrashIcon size={16} /> Delete
        </button>
      )}
    </BottomSheet>
  );
}
