import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import InlineMd from "../components/InlineMd";
import { labs } from "../labs";
import { reference } from "../content/reference";
import { actions, useStore } from "../lib/store";

export default function Labs() {
  const state = useStore();
  const { hash } = useLocation();
  const [open, setOpen] = useState<string | null>(labs[0]?.id ?? null);

  // Topbar search sends people here with /labs#lab-<id>.
  useEffect(() => {
    const want = hash.replace(/^#lab-/, "");
    if (!hash.startsWith("#lab-") || !want) return;
    setOpen(want);
    const t = window.setTimeout(() => {
      document.getElementById(`lab-${want}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
    return () => window.clearTimeout(t);
  }, [hash]);

  const done = labs.filter((l) => state.labsDone[l.id]).length;
  const pct = labs.length ? done / labs.length : 0;

  return (
    <main className="page wide">
      <div className="page-head">
        <h1>Lab tương tác</h1>
        <p className="muted">
          Mỗi lab là một mô phỏng nhỏ của đúng một cái bẫy trong giáo án. Vặn núm, đoán trước kết
          quả, rồi xem mình sai ở đâu — nhớ lâu hơn đọc mười lần.
        </p>
        <div className="labs-progress">
          <div className={"bar" + (pct >= 1 ? " success" : "")} style={{ height: 10 }}>
            <span style={{ width: `${pct * 100}%` }} />
          </div>
          <b style={{ fontSize: 13, whiteSpace: "nowrap" }}>
            {done}/{labs.length} lab
          </b>
        </div>
      </div>

      <div className="lab-list">
        {labs.map((lab) => {
          const isOpen = open === lab.id;
          const isDone = !!state.labsDone[lab.id];
          const secs = lab.sectionIds
            .map((id) => reference.byId[id])
            .filter((s): s is NonNullable<typeof s> => !!s);
          return (
            <div
              key={lab.id}
              id={`lab-${lab.id}`}
              className={"card lab-panel" + (isOpen ? " open" : "")}
            >
              <button
                className="lab-panel-head"
                onClick={() => setOpen(isOpen ? null : lab.id)}
                aria-expanded={isOpen}
              >
                <span className="lp-icon">{lab.icon}</span>
                <span className="lp-text">
                  <span className="lp-title">
                    {lab.title}
                    {isDone && <span className="lp-done">✓ đã nghịch</span>}
                  </span>
                  <span className="lp-blurb">
                    <InlineMd text={lab.blurb} />
                  </span>
                </span>
                <span className="lp-chev">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="lab-panel-body fade">
                  <div className="lp-goal">
                    🎯 <InlineMd text={lab.goal} />
                  </div>
                  <lab.Component />
                  <div className="lp-links">
                    <button
                      className={"chip btn-chip" + (isDone ? " flagship" : "")}
                      onClick={() => actions.completeLab(lab.id)}
                    >
                      {isDone ? "✓ Đã nghịch xong" : "Đánh dấu đã nghịch (+12 XP)"}
                    </button>
                    <span className="muted">Bài liên quan:</span>
                    {secs.map((s) => (
                      <Link key={s.id} className="chip link" to={`/lesson/${s.id}`}>
                        {s.num ? `${s.num} · ` : ""}
                        {s.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
