import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import InlineMd from "../components/InlineMd";
import Markdown, { headingSlug } from "../components/Markdown";
import Quiz from "../components/Quiz";
import { reference } from "../content/reference";
import { exercises } from "../content/exercises";
import { cardsFor, type Flashcard } from "../data/cards";
import { quizFor } from "../data/quizzes";
import { labsBySection } from "../labs";
import { actions, useStore } from "../lib/store";

const DIFF_CLASS: Record<string, string> = { dễ: "d-easy", vừa: "d-mid", khó: "d-hard" };

/**
 * Sub-headings for the in-page table of contents. Fence-aware, and the light
 * markdown markup is stripped so the slug matches what <Markdown> renders.
 */
function subHeadings(body: string): { text: string; slug: string }[] {
  const out: { text: string; slug: string }[] = [];
  let fence = false;
  for (const line of body.split("\n")) {
    if (/^```/.test(line.trim())) {
      fence = !fence;
      continue;
    }
    if (fence) continue;
    const m = line.match(/^###\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const text = m[1]
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*`_]/g, "")
      .trim();
    if (text) out.push({ text, slug: headingSlug(text) });
  }
  return out;
}

function Peek({ card }: { card: Flashcard }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card peek" onClick={() => setOpen((v) => !v)} style={{ cursor: "pointer" }}>
      <div className="peek-q">
        <Markdown>{card.front}</Markdown>
      </div>
      {open ? (
        <div className="peek-a">
          <Markdown>{card.back}</Markdown>
        </div>
      ) : (
        <div className="peek-a muted" style={{ fontSize: 12.5 }}>
          Bấm để xem đáp án
        </div>
      )}
    </div>
  );
}

export default function Lesson() {
  const { id = "" } = useParams();
  const state = useStore();

  const section = reference.byId[id];
  const part = reference.parts.find((p) => p.id === section?.partId);

  const flow = section?.partId && part?.isAppendix ? reference.appendixSections : reference.lessonSections;
  const index = flow.findIndex((s) => s.id === id);
  const prev = index > 0 ? flow[index - 1] : undefined;
  const next = index >= 0 && index < flow.length - 1 ? flow[index + 1] : undefined;

  const toc = useMemo(() => (section ? subHeadings(section.body) : []), [section]);
  const labs = labsBySection[id] ?? [];
  const questions = quizFor(id);
  const cards = cardsFor(id);
  const drills = exercises.filter((e) => e.sectionIds.includes(id));

  if (!section || !part) {
    return (
      <main className="page">
        <div className="empty">
          <div className="emoji">🧭</div>
          <h3>Không tìm thấy bài học này</h3>
          <p>Bài học có thể đã đổi số khi tài liệu được cập nhật.</p>
          <Link className="btn primary mt" to="/">
            Về trang tổng quan
          </Link>
        </div>
      </main>
    );
  }

  const done = !!state.progress[id]?.read;
  const isFirstOfPart = part.sections[0]?.id === id;
  const quizBest = state.progress[id]?.quizBest ?? 0;

  return (
    <main className="page wide lesson-page">
      <div className="crumbs">
        <Link to="/">Tổng quan</Link>
        <span>›</span>
        {part.isAppendix ? (
          <Link to="/reference">Phụ lục &amp; Tra cứu</Link>
        ) : (
          <Link to={`/lesson/${part.sections[0].id}`}>{part.label}</Link>
        )}
        <span>›</span>
        <span className="crumb-current">{section.num || section.title}</span>
      </div>

      <div className="lesson-head">
        <div className="lesson-head-main">
          <div className="lesson-eyebrow">
            {part.label} — {part.name}
            {part.week !== null && ` · Tuần ${part.week}`}
          </div>
          <h1>
            {section.num && <span className="lesson-num">{section.num}</span>}
            {section.title}
          </h1>
          <div className="lesson-meta row wrap" style={{ gap: 14, fontSize: 13 }}>
            <span className="muted">~{section.minutes} phút đọc</span>
            {section.codeBlocks > 0 && (
              <span className="muted">{section.codeBlocks} khối mã</span>
            )}
            {labs.length > 0 && <span className="meta-lab">⚗ {labs.length} lab tương tác</span>}
            {section.marks.ok > 0 && <span className="meta-ok">✅ {section.marks.ok}</span>}
            {section.marks.warn > 0 && <span className="meta-warn">⚠️ {section.marks.warn}</span>}
            {section.marks.unknown > 0 && (
              <span className="muted" title="Những chỗ bạn phải tự kiểm chứng trên máy">
                ❓ {section.marks.unknown}
              </span>
            )}
            {section.isTrap && <span className="chip">🪤 Sổ tay bẫy</span>}
            {section.isPractice && <span className="chip">🛠 Bài tập</span>}
          </div>
        </div>
        <button
          className={"btn read-btn" + (done ? " done" : " primary")}
          onClick={() => actions.markSectionRead(id)}
          disabled={done}
        >
          {done ? "✓ Đã học xong" : "Đánh dấu đã học (+15 XP)"}
        </button>
      </div>

      {toc.length > 2 && (
        <details className="card lesson-toc">
          <summary>Trong bài này ({toc.length} phần)</summary>
          <ol>
            {toc.map((h) => (
              <li key={h.slug}>
                <a
                  href={`#${h.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(h.slug)?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </details>
      )}

      {isFirstOfPart && part.intro && (
        <div className="lesson-block">
          <div className="block-head">
            <h2>
              <span className="block-ico">🧭</span>Mở đầu {part.label.toLowerCase()}
            </h2>
            <p className="muted">Bối cảnh của cả chương — đọc trước khi vào từng mục.</p>
          </div>
          <div className="card pad">
            <Markdown>{part.intro}</Markdown>
          </div>
        </div>
      )}

      <div className="lesson-body">
        <Markdown>{section.body}</Markdown>
      </div>

      {labs.map((lab) => (
        <div className="lesson-block" key={lab.id}>
          <div className="block-head">
            <h2>
              <span className="block-ico">{lab.icon}</span>
              {lab.title}
            </h2>
            <p className="muted">
              <InlineMd text={lab.blurb} />
            </p>
          </div>
          <div className="lp-goal">
            🎯 <InlineMd text={lab.goal} />
          </div>
          <lab.Component />
          <div className="lp-links">
            <button
              className={"chip btn-chip" + (state.labsDone[lab.id] ? " flagship" : "")}
              onClick={() => actions.completeLab(lab.id)}
            >
              {state.labsDone[lab.id] ? "✓ Đã nghịch xong lab này" : "Đánh dấu đã nghịch (+12 XP)"}
            </button>
            <Link className="chip btn-chip" to="/labs">
              Xem tất cả lab →
            </Link>
          </div>
        </div>
      ))}

      {(questions.length > 0 || cards.length > 0 || drills.length > 0) && (
        <section className="practice-pane">
          <div className="practice-intro">
            <span style={{ fontSize: 22 }}>🎓</span>
            <span>
              Đọc xong chưa phải là biết. Ba việc dưới đây biến bài vừa đọc thành thứ dùng được.
            </span>
          </div>

          {questions.length > 0 && (
            <div className="practice-block">
              <div className="pb-head">
                <h3>
                  <span className="pb-ico">✅</span>Kiểm tra hiểu bài
                </h3>
                {quizBest > 0 && (
                  <span className="chip">Điểm cao nhất {Math.round(quizBest * 100)}%</span>
                )}
              </div>
              <div className="card pad">
                <Quiz questions={questions} onComplete={(score) => actions.recordQuiz(id, score)} />
              </div>
            </div>
          )}

          {cards.length > 0 && (
            <div className="practice-block">
              <div className="pb-head">
                <h3>
                  <span className="pb-ico">🧠</span>Thẻ ghi nhớ của bài này
                </h3>
                <Link className="chip btn-chip" to="/review">
                  Ôn có lịch →
                </Link>
              </div>
              <div className="card-peek">
                {cards.map((c) => (
                  <Peek key={c.id} card={c} />
                ))}
              </div>
              <p className="fc-source">
                {cards.length} thẻ. Chúng sẽ tự xuất hiện lại trong mục “Ôn tập hàng ngày” đúng lúc
                bạn sắp quên.
              </p>
            </div>
          )}

          {drills.length > 0 && (
            <div className="practice-block">
              <div className="pb-head">
                <h3>
                  <span className="pb-ico">🛠</span>Làm trên máy thật
                </h3>
                <Link className="chip btn-chip" to="/exercises">
                  Lộ trình 7 tuần →
                </Link>
              </div>
              <div className="rel-ex">
                {drills.map((e) => (
                  <Link className="card rel-ex-item" key={e.id} to="/exercises">
                    <span className="rx-week">TUẦN {e.week}</span>
                    <span className="rx-title">
                      {e.flagship && "★ "}
                      {e.title}
                    </span>
                    <span className={"chip diff " + (DIFF_CLASS[e.difficulty] ?? "d-mid")}>
                      {e.difficulty}
                    </span>
                    {state.exercises[e.id]?.done && <span style={{ color: "var(--success)" }}>✓</span>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {!done && (
        <div className="practice-cta">
          <span className="pc-emoji">🚀</span>
          <div className="pc-grow">
            <h3>Xong bài này rồi?</h3>
            <p>
              Đánh dấu đã học để mở khoá tiến độ chương và nhận 15 XP — thẻ ghi nhớ của bài sẽ vào
              lịch ôn.
            </p>
          </div>
          <button className="btn primary lg" onClick={() => actions.markSectionRead(id)}>
            Đánh dấu đã học
          </button>
        </div>
      )}

      <div className="lesson-navrow">
        {prev ? (
          <Link className="lesson-nav" to={`/lesson/${prev.id}`}>
            <span className="ln-dir">← Bài trước</span>
            <span className="ln-title">
              {prev.num ? `${prev.num} · ` : ""}
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="lesson-nav next" to={`/lesson/${next.id}`}>
            <span className="ln-dir">Bài tiếp →</span>
            <span className="ln-title">
              {next.num ? `${next.num} · ` : ""}
              {next.title}
            </span>
          </Link>
        ) : (
          <Link className="lesson-nav next" to="/reference">
            <span className="ln-dir">Hết chương trình →</span>
            <span className="ln-title">Sang phần Phụ lục &amp; Tra cứu</span>
          </Link>
        )}
      </div>
    </main>
  );
}
