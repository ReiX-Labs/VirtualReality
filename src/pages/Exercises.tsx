import { useState } from "react";
import { Link } from "react-router-dom";
import InlineMd from "../components/InlineMd";
import Markdown from "../components/Markdown";
import { reference } from "../content/reference";
import { exercises, weeks, type Exercise } from "../content/exercises";
import { actions, useStore } from "../lib/store";

const DIFF_CLASS: Record<string, string> = { dễ: "d-easy", vừa: "d-mid", khó: "d-hard" };

function ExerciseCard({ ex }: { ex: Exercise }) {
  const state = useStore();
  const st = state.exercises[ex.id];
  const done = !!st?.done;
  const [editing, setEditing] = useState(false);

  const secs = ex.sectionIds
    .map((id) => reference.byId[id])
    .filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <div className={"ex" + (done ? " done" : "")}>
      <label className="ex-check" title={done ? "Bỏ đánh dấu" : "Đánh dấu đã làm xong"}>
        <input type="checkbox" checked={done} onChange={() => actions.toggleExercise(ex.id)} />
        <span className="ex-box">{done ? "✓" : ""}</span>
      </label>

      <div className="ex-main">
        <div className="ex-title-row">
          <h3>{ex.title}</h3>
          {ex.flagship && <span className="chip flagship">★ bài chốt tuần</span>}
          <span className={"chip diff " + (DIFF_CLASS[ex.difficulty] ?? "d-mid")}>
            {ex.difficulty}
          </span>
        </div>

        <div className="ex-brief">
          <Markdown>{ex.brief}</Markdown>
        </div>

        {ex.done.length > 0 && (
          <div className="ex-done">
            <div className="ex-done-label">Xong là khi</div>
            <ul>
              {ex.done.map((d, i) => (
                <li key={i}>
                  <InlineMd text={d} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="ex-foot">
          {secs.map((s) => (
            <Link key={s.id} className="chip link" to={`/lesson/${s.id}`}>
              📘 {s.num ? `${s.num} · ` : ""}
              {s.title}
            </Link>
          ))}
          <button className="chip btn-chip" onClick={() => setEditing((v) => !v)}>
            {editing ? "Đóng ghi chú" : st?.note ? "Sửa ghi chú" : "+ Ghi chú"}
          </button>
        </div>

        {editing ? (
          <textarea
            className="ex-note"
            rows={3}
            autoFocus
            placeholder="Bạn kẹt ở đâu? Số đo trên device? Link build?"
            value={st?.note ?? ""}
            onChange={(e) => actions.setExerciseNote(ex.id, e.target.value)}
          />
        ) : (
          st?.note && <div className="ex-note-preview">{st.note}</div>
        )}
      </div>
    </div>
  );
}

export default function Exercises() {
  const state = useStore();
  const [open, setOpen] = useState<number | null>(() => {
    const w = weeks.find((wk) => wk.exercises.some((e) => !state.exercises[e.id]?.done));
    return w?.week ?? weeks[0]?.week ?? null;
  });

  const doneTotal = exercises.filter((e) => state.exercises[e.id]?.done).length;
  const pct = exercises.length ? doneTotal / exercises.length : 0;

  return (
    <main className="page wide">
      <div className="page-head">
        <h1>Lộ trình 7 tuần</h1>
        <p className="muted">
          Đọc hiểu là một chuyện, tay làm được là chuyện khác. {exercises.length} bài tập dưới đây
          bám sát giáo án và đều kết thúc bằng thứ chạy được trên Quest 3 thật — không phải trong
          editor.
        </p>
        <div className="labs-progress">
          <div className={"bar" + (pct >= 1 ? " success" : "")} style={{ height: 10 }}>
            <span style={{ width: `${pct * 100}%` }} />
          </div>
          <b style={{ fontSize: 13, whiteSpace: "nowrap" }}>
            {doneTotal}/{exercises.length} bài
          </b>
        </div>
      </div>

      <div className="weeks">
        {weeks.map((wk) => {
          const isOpen = open === wk.week;
          const d = wk.exercises.filter((e) => state.exercises[e.id]?.done).length;
          const allDone = d === wk.exercises.length && wk.exercises.length > 0;
          return (
            <div key={wk.week} className={"card week" + (isOpen ? " open" : "")}>
              <button
                className="week-head"
                onClick={() => setOpen(isOpen ? null : wk.week)}
                aria-expanded={isOpen}
              >
                <span className={"week-num" + (allDone ? " done" : "")}>
                  {allDone ? "✓" : wk.week}
                </span>
                <span className="week-text">
                  <span className="week-theme">{wk.theme}</span>
                  <span className="week-focus">{wk.focus}</span>
                </span>
                <span className="week-count">
                  {d}/{wk.exercises.length}
                </span>
                <span className="week-chev">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="week-body fade">
                  {wk.exercises.map((ex) => (
                    <ExerciseCard key={ex.id} ex={ex} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="practice-cta mt-lg">
        <span className="pc-emoji">🧪</span>
        <div className="pc-grow">
          <h3>Chưa có device để test?</h3>
          <p>
            Các lab tương tác mô phỏng đúng những cái bẫy trong các bài tập này — nghịch trước để
            biết mình sẽ vấp ở đâu.
          </p>
        </div>
        <Link className="btn primary lg" to="/labs">
          Mở lab tương tác
        </Link>
      </div>
    </main>
  );
}
