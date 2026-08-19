import { ACHIEVEMENTS, isUnlocked } from "../lib/gamify";
import { useStore } from "../lib/store";

export default function Achievements() {
  const state = useStore();
  const unlockedCount = ACHIEVEMENTS.filter((a) => isUnlocked(a, state)).length;

  return (
    <section>
      <div className="row spread" style={{ marginBottom: 14 }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          Huy hiệu
        </h2>
        <span className="muted" style={{ fontSize: 13 }}>
          {unlockedCount}/{ACHIEVEMENTS.length} đã mở khoá
        </span>
      </div>
      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const prog = Math.min(a.progress(state), a.goal);
          const done = prog >= a.goal;
          return (
            <div key={a.id} className={"ach" + (done ? " unlocked" : "")} title={a.desc}>
              <div className="ach-ico">{a.icon}</div>
              <div className="ach-body">
                <div className="ach-title">{a.title}</div>
                <div className="ach-desc">{a.desc}</div>
                {!done && (
                  <div className="ach-prog">
                    <div className="bar" style={{ height: 5 }}>
                      <span style={{ width: `${(prog / a.goal) * 100}%` }} />
                    </div>
                    <span>
                      {prog}/{a.goal}
                    </span>
                  </div>
                )}
              </div>
              {done && <span className="ach-check">✓</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
