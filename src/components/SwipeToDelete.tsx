import { useRef, useState, type ReactNode } from "react";
import { TrashIcon } from "./icons";

const REVEAL = 84;

export default function SwipeToDelete({ children, onDelete }: { children: ReactNode; onDelete: () => void }) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startDragX = useRef(0);

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    startDragX.current = dragX;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const delta = e.clientX - startX.current;
    const next = Math.max(-REVEAL, Math.min(0, startDragX.current + delta));
    setDragX(next);
  }

  function onPointerUp() {
    setDragging(false);
    setDragX((x) => (x < -REVEAL / 2 ? -REVEAL : 0));
  }

  return (
    <div className="swipe-row">
      <button
        className="swipe-row__action"
        style={{ width: REVEAL }}
        onClick={() => {
          setDragX(0);
          onDelete();
        }}
        aria-label="Delete"
      >
        <TrashIcon size={18} />
      </button>
      <div
        className="swipe-row__content"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : "transform 0.25s var(--ease)",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </div>
    </div>
  );
}
