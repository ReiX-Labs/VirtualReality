import { Link } from "react-router-dom";
import Achievements from "../components/Achievements";
import ActivityHeatmap from "../components/ActivityHeatmap";
import LevelBar from "../components/LevelBar";
import ProgressRing from "../components/ProgressRing";
import { reference } from "../content/reference";
import { exercises } from "../content/exercises";
import { cardIds } from "../data/cards";
import { labs } from "../labs";
import { dueQueue } from "../lib/queue";
import { actions, useStore, xpToday } from "../lib/store";

const GOALS = [10, 20, 40, 80];

export default function Dashboard() {
  const state = useStore();

  const lessons = reference.lessonSections;
  const read = lessons.filter((s) => state.progress[s.id]?.read);
  const pct = lessons.length ? read.length / lessons.length : 0;

  // Where to pick up: the first lesson that has not been marked read.
  const next = lessons.find((s) => !state.progress[s.id]?.read) ?? lessons[0];

  // Cards unlock as lessons are read, so this number stays honest.
  const due = dueQueue(state).length;

  const goalXp = xpToday();
  const goalPct = state.dailyGoal ? goalXp / state.dailyGoal : 0;
  const goalMet = goalXp >= state.dailyGoal;

  const labsDone = labs.filter((l) => state.labsDone[l.id]).length;
  const exDone = exercises.filter((e) => state.exercises[e.id]?.done).length;

  return (
    <main className="page">
      <section className="hero">
        <span className="hero-glow" />
        <h1>Học lập trình VR · MR · XR trên Quest 3</h1>
        <p>
          Toàn bộ giáo án <b>Unreal Engine 5.6 + Meta Quest 3</b> được chia thành {lessons.length}{" "}
          bài học ngắn, {labs.length} lab tương tác và {cardIds.length} thẻ ôn tập ngắt quãng. Học
          theo thứ tự, làm bài tập trên máy thật, và để phần nhắc lại cho hệ thống lo.
        </p>
        <div className="hero-actions">
          <Link className="btn primary lg" to={`/lesson/${next?.id ?? lessons[0]?.id}`}>
            {read.length === 0 ? "Bắt đầu học →" : "Học tiếp →"}
          </Link>
          <Link className="btn lg ghost" to="/review">
            ↻ Ôn tập hôm nay{due > 0 && ` (${due})`}
          </Link>
          <Link className="btn lg ghost" to="/labs">
            ⚗ Lab tương tác
          </Link>
        </div>
      </section>

      <div className="stat-grid" style={{ marginBottom: 22 }}>
        <div className="stat">
          <span className="stat-ico" style={{ background: "var(--accent-soft)" }}>
            📘
          </span>
          <div>
            <div className="stat-val">
              {read.length}
              <span className="muted" style={{ fontSize: 15, fontWeight: 600 }}>
                /{lessons.length}
              </span>
            </div>
            <div className="stat-label">bài học đã xong</div>
          </div>
        </div>
        <div className="stat">
          <span className="stat-ico" style={{ background: "var(--accent-2-soft)" }}>
            ⚗
          </span>
          <div>
            <div className="stat-val">
              {labsDone}
              <span className="muted" style={{ fontSize: 15, fontWeight: 600 }}>
                /{labs.length}
              </span>
            </div>
            <div className="stat-label">lab đã nghịch</div>
          </div>
        </div>
        <div className="stat">
          <span className="stat-ico" style={{ background: "var(--warning-soft)" }}>
            🛠
          </span>
          <div>
            <div className="stat-val">
              {exDone}
              <span className="muted" style={{ fontSize: 15, fontWeight: 600 }}>
                /{exercises.length}
              </span>
            </div>
            <div className="stat-label">bài luyện tay</div>
          </div>
        </div>
        <div className="stat">
          <span className="stat-ico" style={{ background: "var(--success-soft)" }}>
            🧠
          </span>
          <div>
            <div className="stat-val">{due}</div>
            <div className="stat-label">thẻ đến hạn ôn</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <LevelBar xp={state.xp} />
      </div>

      <div className="dash-split">
        <div>
          <h2 className="section-title">Chương trình học</h2>
          <div className="part-cards">
            {reference.lessonParts.map((part) => {
              const doneIn = part.sections.filter((s) => state.progress[s.id]?.read).length;
              const p = part.sections.length ? doneIn / part.sections.length : 0;
              const minutes = part.sections.reduce((a, s) => a + s.minutes, 0);
              return (
                <Link
                  key={part.id}
                  className="card part-card"
                  to={`/lesson/${part.sections[0].id}`}
                >
                  <div className="pc-label">
                    {part.label}
                    {part.week !== null && ` · TUẦN ${part.week}`}
                  </div>
                  <div className="pc-title">{part.name}</div>
                  <div className="pc-meta">
                    <span>
                      {doneIn}/{part.sections.length} bài
                    </span>
                    <span>~{minutes} phút</span>
                  </div>
                  <div className={"bar" + (p >= 1 ? " success" : "")}>
                    <span style={{ width: `${p * 100}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>

          <h2 className="section-title" style={{ marginTop: 28 }}>
            Đi thẳng tới
          </h2>
          <div className="part-cards">
            <Link className="card part-card" to="/exercises">
              <div className="pc-label">LỘ TRÌNH</div>
              <div className="pc-title">7 tuần luyện tay trên máy thật</div>
              <div className="pc-meta">
                <span>{exercises.length} bài tập</span>
                <span>{exDone} đã xong</span>
              </div>
            </Link>
            <Link className="card part-card" to="/traps">
              <div className="pc-label">SỔ TAY</div>
              <div className="pc-title">Bẫy thực địa — đọc trước khi mất buổi chiều</div>
              <div className="pc-meta">
                <span>{reference.trapSections.length} mục bẫy</span>
                <span>tra nhanh</span>
              </div>
            </Link>
            <Link className="card part-card" to="/reference">
              <div className="pc-label">PHỤ LỤC</div>
              <div className="pc-title">Tra cứu: lệnh, config, nguồn chính thức</div>
              <div className="pc-meta">
                <span>{reference.appendixParts.length} phụ lục</span>
                <span>{reference.appendixSections.length} mục</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="dash-goal">
          <div className="card pad center">
            <h2 className="section-title">Mục tiêu hôm nay</h2>
            <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 14px" }}>
              <ProgressRing
                value={goalPct}
                size={132}
                label={`${goalXp}`}
                sub={`/ ${state.dailyGoal} XP`}
                color={goalMet ? "var(--success)" : "var(--accent)"}
              />
            </div>
            <p className="muted" style={{ fontSize: 13, margin: "0 0 14px", lineHeight: 1.6 }}>
              {goalMet
                ? "Xong mục tiêu hôm nay. Chuỗi của bạn an toàn 🔥"
                : "Một bài học là 15 XP, một lượt ôn thẻ là 1–5 XP. Học đều mỗi ngày hơn là học dồn."}
            </p>
            <div className="row wrap" style={{ justifyContent: "center", gap: 6 }}>
              {GOALS.map((g) => (
                <button
                  key={g}
                  className={"chip btn-chip" + (state.dailyGoal === g ? " flagship" : "")}
                  onClick={() => actions.setDailyGoal(g)}
                >
                  {g} XP
                </button>
              ))}
            </div>
          </div>

          <div className="card pad mt">
            <h2 className="section-title">Tiến độ tổng</h2>
            <div className="row spread" style={{ fontSize: 13, marginBottom: 8 }}>
              <span className="muted">Toàn bộ bài học</span>
              <b>{Math.round(pct * 100)}%</b>
            </div>
            <div className={"bar" + (pct >= 1 ? " success" : "")} style={{ height: 10 }}>
              <span style={{ width: `${pct * 100}%` }} />
            </div>
            <div className="data-stats" style={{ marginTop: 16 }}>
              <span>
                Chuỗi <b>{state.streak.count} ngày</b>
              </span>
              <span>
                Tổng <b>{state.xp} XP</b>
              </span>
            </div>
            {next && (
              <Link className="btn primary block mt" to={`/lesson/${next.id}`}>
                Bài kế tiếp: {next.num || next.title}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-lg">
        <ActivityHeatmap />
      </div>

      <div className="mt-lg">
        <Achievements />
      </div>
    </main>
  );
}
