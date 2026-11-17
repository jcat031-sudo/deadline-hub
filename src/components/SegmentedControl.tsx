export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  return (
    <div className="segmented" style={{ "--count": options.length } as React.CSSProperties}>
      <div className="segmented__thumb" style={{ transform: `translateX(${index * 100}%)` }} />
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`segmented__item${value === opt.value ? " segmented__item--active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
