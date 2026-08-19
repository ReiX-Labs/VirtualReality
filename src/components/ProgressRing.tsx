interface Props {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
  color?: string;
}

export default function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  label,
  sub,
  color = "var(--accent)",
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  const offset = c * (1 - clamped);

  return (
    <div className="score-ring" style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {label != null && (
          <div style={{ fontSize: size * 0.24, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {label}
          </div>
        )}
        {sub != null && <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{sub}</div>}
      </div>
    </div>
  );
}
