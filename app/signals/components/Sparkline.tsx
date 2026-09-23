export default function Sparkline({ values, up }: { values: number[]; up?: boolean }) {
  if (!values.length) {
    return <div className="h-8 w-full rounded bg-white/5" aria-hidden />;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const width = 120;
  const height = 32;
  const d = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const color = up === false ? "#f43f5e" : "#34d399";
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-8 w-full" aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
