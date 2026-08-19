import { DAY_MS, dayKey, startOfDay } from "../lib/srs";
import { useStore } from "../lib/store";

const WEEKS = 18;

function intensity(xp: number): number {
  if (xp <= 0) return 0;
  if (xp < 20) return 1;
  if (xp < 50) return 2;
  if (xp < 100) return 3;
  return 4;
}

function cellColor(level: number): string {
  if (level === 0) return "var(--surface-2)";
  const pctMap = [0, 30, 50, 72, 100];
  return `color-mix(in srgb, var(--accent) ${pctMap[level]}%, var(--surface-2))`;
}

export default function ActivityHeatmap() {
  const state = useStore();
  const today = startOfDay();

  const days: { key: string; xp: number; dow: number }[] = [];
  const total = WEEKS * 7;
  for (let i = total - 1; i >= 0; i--) {
    const d = new Date(today - i * DAY_MS);
    const key = dayKey(d);
    days.push({ key, xp: state.activityByDay[key]?.xp ?? 0, dow: d.getDay() });
  }
  const pad = days[0].dow; // empty cells before the first day so weeks align
  const cells: ({ key: string; xp: number } | null)[] = [
    ...Array(pad).fill(null),
    ...days.map((d) => ({ key: d.key, xp: d.xp })),
  ];

  const activeDays = days.filter((d) => d.xp > 0).length;

  return (
    <div className="card pad">
      <div className="row spread" style={{ marginBottom: 14 }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          Hoạt động {WEEKS} tuần gần đây
        </h2>
        <span className="muted" style={{ fontSize: 13 }}>
          {activeDays} ngày có học
        </span>
      </div>
      <div className="heatmap">
        {cells.map((c, i) =>
          c ? (
            <div
              key={c.key}
              className="hm-cell"
              style={{ background: cellColor(intensity(c.xp)) }}
              title={`${c.key}: ${c.xp} XP`}
            />
          ) : (
            <div key={"pad" + i} className="hm-cell empty" />
          ),
        )}
      </div>
      <div className="row" style={{ justifyContent: "flex-end", gap: 6, marginTop: 10 }}>
        <span className="muted" style={{ fontSize: 11 }}>
          ít
        </span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className="hm-cell" style={{ background: cellColor(l) }} />
        ))}
        <span className="muted" style={{ fontSize: 11 }}>
          nhiều
        </span>
      </div>
    </div>
  );
}
