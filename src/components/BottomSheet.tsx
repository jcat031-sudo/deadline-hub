import { useRef, useState, type ReactNode } from "react";
import { CloseIcon } from "./icons";

const DISMISS_THRESHOLD = 90;

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  function onPointerDown(e: React.PointerEvent) {
    startY.current = e.clientY;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setDragY(Math.max(0, e.clientY - startY.current));
  }

  function onPointerUp() {
    setDragging(false);
    if (dragY > DISMISS_THRESHOLD) {
      onClose();
    }
    setDragY(0);
  }

  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : "transform 0.25s var(--ease)",
        }}
      >
        <div
          className="sheet__drag-handle"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="sheet__handle" />
          <div className="sheet__header">
            <h2>{title}</h2>
            <button className="icon-btn" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  );
}
