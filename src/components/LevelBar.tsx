import { levelInfo } from "../lib/gamify";

export default function LevelBar({ xp }: { xp: number }) {
  const lv = levelInfo(xp);
  const pct = Math.min(1, lv.into / lv.need);
  return (
    <div className="card pad level-card">
      <div className="level-badge">{lv.level}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row spread" style={{ marginBottom: 6 }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: 16 }}>Cấp {lv.level}</span>
            <span className="muted" style={{ marginLeft: 8, fontSize: 13.5 }}>
              {lv.title}
            </span>
          </div>
          <span className="muted" style={{ fontSize: 13 }}>
            {lv.into}/{lv.need} XP → cấp {lv.level + 1}
          </span>
        </div>
        <div className="bar" style={{ height: 10 }}>
          <span style={{ width: `${pct * 100}%` }} />
        </div>
      </div>
      <div className="level-xp">
        <div className="stat-val" style={{ fontSize: 22 }}>
          {xp}
        </div>
        <div className="stat-label">tổng XP</div>
      </div>
    </div>
  );
}
