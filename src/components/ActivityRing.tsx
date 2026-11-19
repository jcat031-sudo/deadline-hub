export default function ActivityRing({
  progress, // 0-1+ (can exceed 1, ring just completes a full loop and caps the arc)
  size = 92,
  stroke = 11,
  color,
  trackColor = "var(--surface-3)",
}: {
  progress: number;
  size?: number;
  stroke?: number;
  color: string;
  trackColor?: string;
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, progress));
  const dash = circumference * pct;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        className="activity-ring__progress"
      />
    </svg>
  );
}
