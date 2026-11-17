import { useRef, useState } from "react";
import BottomSheet from "./BottomSheet";
import { useApp, type ImportDeadlineItem } from "../data/AppContext";
import type { DeadlineType } from "../data/types";

const VALID_TYPES: DeadlineType[] = ["homework", "quiz", "lab report", "project", "midterm", "final", "other"];

interface ParsedItem extends ImportDeadlineItem {
  selected: boolean;
  duplicate: boolean;
}

function validateItems(raw: unknown): { items: ImportDeadlineItem[] } | string {
  if (typeof raw !== "object" || raw === null || !("items" in raw)) {
    return 'JSON must be an object with an "items" array.';
  }
  const items = (raw as { items: unknown }).items;
  if (!Array.isArray(items)) {
    return '"items" must be an array.';
  }
  for (const [i, item] of items.entries()) {
    if (typeof item !== "object" || item === null) return `Item ${i + 1} is not an object.`;
    const it = item as Record<string, unknown>;
    if (typeof it.course !== "string" || !it.course.trim()) return `Item ${i + 1} is missing "course".`;
    if (typeof it.title !== "string" || !it.title.trim()) return `Item ${i + 1} is missing "title".`;
    if (typeof it.type !== "string" || !VALID_TYPES.includes(it.type as DeadlineType)) {
      return `Item ${i + 1} has invalid "type" (must be one of ${VALID_TYPES.join(", ")}).`;
    }
    if (typeof it.due !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(it.due)) {
      return `Item ${i + 1} has invalid "due" (expected "YYYY-MM-DDTHH:MM").`;
    }
  }
  return { items: items as ImportDeadlineItem[] };
}

export default function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { findDuplicateDeadlines, importDeadlines } = useApp();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [parsed, setParsed] = useState<ParsedItem[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setText("");
    setError("");
    setParsed(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function doParse(jsonText: string) {
    setError("");
    try {
      const raw = JSON.parse(jsonText);
      const result = validateItems(raw);
      if (typeof result === "string") {
        setError(result);
        setParsed(null);
        return;
      }
      const dupes = findDuplicateDeadlines(result.items);
      setParsed(
        result.items.map((item, i) => ({
          ...item,
          platform: item.platform ?? "",
          notes: item.notes ?? "",
          selected: !dupes[i],
          duplicate: dupes[i],
        }))
      );
    } catch {
      setError("That isn't valid JSON. Check for missing commas or quotes.");
      setParsed(null);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      setText(content);
      doParse(content);
    };
    reader.readAsText(file);
  }

  function handleConfirm() {
    if (!parsed) return;
    const toImport = parsed.filter((p) => p.selected && !p.duplicate);
    importDeadlines(toImport);
    handleClose();
  }

  const selectedCount = parsed?.filter((p) => p.selected && !p.duplicate).length ?? 0;
  const duplicateCount = parsed?.filter((p) => p.duplicate).length ?? 0;

  return (
    <BottomSheet open={open} onClose={handleClose} title="Import deadlines">
      {!parsed && (
        <>
          <div className="field">
            <label>Paste JSON</label>
            <textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='{"items": [{"course": "ES 220", "title": "Midterm 1", "type": "midterm", "due": "2027-02-19T09:00", "platform": "Moodle", "notes": "Ch. 1-4"}]}'
            />
          </div>
          {error && <p className="inline-error">{error}</p>}
          <button className="btn btn-primary btn-block" onClick={() => doParse(text)} disabled={!text.trim()}>
            Preview
          </button>
          <button
            className="btn btn-secondary btn-block"
            style={{ marginTop: 10 }}
            onClick={() => fileRef.current?.click()}
          >
            Choose a JSON file
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleFile} />
        </>
      )}

      {parsed && (
        <>
          <p className="card__sub" style={{ marginBottom: 10 }}>
            {selectedCount} will be added
            {duplicateCount > 0 ? ` · ${duplicateCount} duplicate${duplicateCount > 1 ? "s" : ""} skipped` : ""}
          </p>
          {parsed.map((item, i) => (
            <label className="import-preview-item" key={i}>
              <input
                type="checkbox"
                checked={item.selected}
                disabled={item.duplicate}
                onChange={(e) =>
                  setParsed((prev) =>
                    prev ? prev.map((p, j) => (j === i ? { ...p, selected: e.target.checked } : p)) : prev
                  )
                }
              />
              <div>
                <div style={{ fontWeight: 600 }}>
                  {item.course}: {item.title}
                </div>
                <div className="card__sub">
                  {item.type} &middot; {item.due.replace("T", " ")}
                  {item.duplicate && " · already added"}
                </div>
              </div>
            </label>
          ))}
          <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={handleConfirm} disabled={selectedCount === 0}>
            Import {selectedCount}
          </button>
          <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={reset}>
            Back
          </button>
        </>
      )}
    </BottomSheet>
  );
}
