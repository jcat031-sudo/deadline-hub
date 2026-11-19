import { useRef, useState } from "react";

interface Series {
  label: string;
  color: string;
  points: { x: number; y: number }[];
  area?: boolean;
  dashed?: boolean;
}

export default function LineChart({
  series,
  height = 170,
  yLabel,
  formatX,
  formatY,
}: {
  series: Series[];
  height?: number;
  yLabel?: string;
  formatX?: (x: number) => string;
  formatY?: (y: number) => string;
}) {
  const width = 320;
  const padding = { top: 14, right: 10, bottom: 20, left: 6 };
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

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
  const yPad = Math.max((yMaxRaw - yMinRaw) * 0.18, 2);
  const yMin = Math.max(0, yMinRaw - yPad);
  const yMax = yMaxRaw + yPad;

  const scaleX = (x: number) =>
    xMax === xMin
      ? padding.left + (width - padding.left - padding.right) / 2
      : padding.left + ((x - xMin) / (xMax - xMin)) * (width - padding.left - padding.right);
  const scaleY = (y: number) =>
    height - padding.bottom - ((y - yMin) / (yMax - yMin || 1)) * (height - padding.top - padding.bottom);

  const primary = series[0];

  function handlePointer(clientX: number) {
    const svg = svgRef.current;
    if (!svg || primary.points.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * width;
    let nearest = 0;
    let best = Infinity;
    primary.points.forEach((p, i) => {
      const d = Math.abs(scaleX(p.x) - relX);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setActiveIdx(nearest);
  }

  const active = activeIdx !== null ? primary.points[activeIdx] : null;

  return (
    <div className="chart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="line-chart"
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={(e) => handlePointer(e.clientX)}
        onPointerMove={(e) => {
          if (e.buttons === 1 || e.pointerType !== "mouse") handlePointer(e.clientX);
        }}
        onPointerUp={() => setActiveIdx(null)}
        onPointerLeave={() => setActiveIdx(null)}
      >
        <defs>
          {series.map(
            (s, i) =>
              s.area && (
                <linearGradient id={`chart-grad-${i}`} key={i} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                </linearGradient>
              )
          )}
        </defs>

        {/* minimal gridlines: just top/mid/baseline */}
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + f * (height - padding.top - padding.bottom)}
            y2={padding.top + f * (height - padding.top - padding.bottom)}
            stroke="var(--border)"
            strokeWidth={0.5}
          />
        ))}

        {yLabel && (
          <text x={width - padding.right} y={padding.top - 4} className="line-chart__axis-label" textAnchor="end">
            {yLabel}
          </text>
        )}

        {series.map((s, i) => {
          if (s.points.length === 0) return null;
          const d = s.points.map((p, j) => `${j === 0 ? "M" : "L"}${scaleX(p.x)},${scaleY(p.y)}`).join(" ");
          const areaD =
            s.area && s.points.length > 0
              ? `${d} L${scaleX(s.points[s.points.length - 1].x)},${height - padding.bottom} L${scaleX(s.points[0].x)},${height - padding.bottom} Z`
              : "";
          return (
            <g key={s.label}>
              {s.area && <path d={areaD} fill={`url(#chart-grad-${i})`} stroke="none" />}
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={s.dashed ? "5 4" : undefined}
                opacity={s.dashed ? 0.8 : 1}
              />
              {!s.dashed &&
                s.points.map((p, j) => (
                  <circle key={j} cx={scaleX(p.x)} cy={scaleY(p.y)} r={i === 0 ? 2.5 : 2} fill={s.color} />
                ))}
            </g>
          );
        })}

        {active && (
          <g>
            <line
              x1={scaleX(active.x)}
              x2={scaleX(active.x)}
              y1={padding.top}
              y2={height - padding.bottom}
              stroke="var(--text-faint)"
              strokeWidth={1}
            />
            <circle cx={scaleX(active.x)} cy={scaleY(active.y)} r={4.5} fill={primary.color} stroke="var(--surface)" strokeWidth={2} />
          </g>
        )}
      </svg>

      {active && (
        <div
          className="chart-crosshair-label"
          style={{
            left: `${(scaleX(active.x) / width) * 100}%`,
            top: `${(scaleY(active.y) / height) * 100}%`,
          }}
        >
          {formatX ? formatX(active.x) + " · " : ""}
          {formatY ? formatY(active.y) : active.y}
        </div>
      )}
    </div>
  );
}
