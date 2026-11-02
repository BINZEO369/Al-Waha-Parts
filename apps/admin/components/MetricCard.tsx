export function MetricCard({
  label,
  value,
  note,
  accent = 'red',
}: {
  label: string;
  value: string | number;
  note: string;
  accent?: 'red' | 'dark';
}) {
  return <article className={`metric-card metric-${accent}`}><div className="metric-top"><span className="metric-index">LIVE</span><span className="metric-dot" /></div><span className="metric-label">{label}</span><strong>{value}</strong><small>{note}</small></article>;
}
