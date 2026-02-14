export default function Sparkline({ data = [], positive = true }) {
  if (!data.length) return <span className="sparkline-empty">-</span>;

  const width = 110;
  const height = 34;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={points} fill="none" stroke={positive ? "#2f6b4a" : "#ac4f3a"} strokeWidth="2.2" />
    </svg>
  );
}
