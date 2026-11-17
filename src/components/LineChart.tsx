interface Series {
  label: string;
  color: string;
  points: { x: number; y: number }[];
}

export default function LineChart({
  series,
  height = 160,
  yLabel,
}: {
  series: Series[];
  height?: number;
  yLabel?: string;
}) {
  const width = 320;
  const padding = { top: 12, right: 12, bottom: 22, left: 36 };

  const allPoints = series.flatMap((s) => s.points);
  if (allPoints.length === 0) {
    return <div className="chart-empty">Not enough data yet</div>;
  }

  const xs = allPoints.map((p) => p.x);
  const ys = allPoints.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMinRaw = Math.min(...ys);
  const yMaxRaw = Math.max(...ys);
  const yPad = Math.max((yMaxRaw - yMinRaw) * 0.15, 2);
  const yMin = Math.max(0, yMinRaw - yPad);
  const yMax = yMaxRaw + yPad;

  const scaleX = (x: number) =>
    xMax === xMin
      ? padding.left + (width - padding.left - padding.right) / 2
      : padding.left + ((x - xMin) / (xMax - xMin)) * (width - padding.left - padding.right);
  const scaleY = (y: number) =>
    height - padding.bottom - ((y - yMin) / (yMax - yMin || 1)) * (height - padding.top - padding.bottom);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" preserveAspectRatio="xMidYMid meet">
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="var(--border)"
        strokeWidth={1}
      />
      <text x={2} y={padding.top + 6} className="line-chart__axis-label">
        {Math.round(yMax)}
      </text>
      <text x={2} y={height - padding.bottom} className="line-chart__axis-label">
        {Math.round(yMin)}
      </text>
      {yLabel && (
        <text x={width - padding.right} y={padding.top - 2} className="line-chart__axis-label" textAnchor="end">
          {yLabel}
        </text>
      )}
      {series.map((s) => {
        if (s.points.length === 0) return null;
        const d = s.points
          .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.x)},${scaleY(p.y)}`)
          .join(" ");
        return (
          <g key={s.label}>
            <path d={d} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {s.points.map((p, i) => (
              <circle key={i} cx={scaleX(p.x)} cy={scaleY(p.y)} r={3} fill={s.color} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
