import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Markdown from "../components/Markdown";
import { reference } from "../content/reference";
import { cardById, cardIds } from "../data/cards";
import { newCard, previewInterval, type Grade } from "../lib/srs";
import { SESSION_CAP, activeCardIds, dueQueue } from "../lib/queue";
import { actions, reviewsToday, useStore } from "../lib/store";

const GRADES: { g: Grade; label: string; cls: string }[] = [
  { g: "again", label: "Quên rồi", cls: "again" },
  { g: "hard", label: "Khó", cls: "hard" },
  { g: "good", label: "Được", cls: "good" },
  { g: "easy", label: "Dễ", cls: "easy" },
];

export default function Review() {
  const state = useStore();
  const [queue, setQueue] = useState<string[]>(() => dueQueue(state).slice(0, SESSION_CAP));
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [ahead, setAhead] = useState(false);

  const dueNow = useMemo(() => dueQueue(state).length, [state]);
  const unlocked = activeCardIds(state).length;
  const todayCount = reviewsToday();

  const current = queue.length ? cardById[queue[0]] : undefined;
  const section = current ? reference.byId[current.sectionId] : undefined;
  const srs = current ? state.srs[current.id] ?? newCard() : newCard();

  const grade = (g: Grade) => {
    if (!current) return;
    actions.gradeCard(current.id, g);
    setReviewed((n) => n + 1);
    setFlipped(false);
    setQueue((q) => (g === "again" ? [...q.slice(1), q[0]] : q.slice(1)));
  };

  const startAhead = () => {
    // Learn ahead: the 10 cards whose due date is closest.
    const sorted = [...cardIds].sort(
      (a, b) => (state.srs[a]?.due ?? 0) - (state.srs[b]?.due ?? 0)
    );
    setQueue(sorted.slice(0, 10));
    setAhead(true);
    setFlipped(false);
  };

  if (!current) {
    return (
      <main className="page">
        <div className="review-wrap">
          <div className="empty">
            <div className="emoji">{reviewed > 0 ? "🎉" : "🧠"}</div>
            <h3>
              {reviewed > 0
                ? `Xong ${reviewed} thẻ. Hết hàng đợi hôm nay!`
                : unlocked === 0
                ? "Chưa có thẻ nào được mở khoá"
                : "Không có thẻ nào đến hạn"}
            </h3>
            <p>
              {unlocked === 0 ? (
                <>
                  Thẻ ôn tự mở khoá theo bài bạn đã học — đánh dấu “đã học” một bài bất kỳ là thẻ
                  của bài đó vào hàng đợi. Muốn xem trước thì bấm nút dưới đây.
                </>
              ) : (
                <>
                  Hôm nay bạn đã ôn <b>{todayCount}</b> lượt, đã mở khoá <b>{unlocked}</b> thẻ. Thẻ
                  sẽ tự quay lại đúng lúc bạn sắp quên.
                </>
              )}
            </p>
            <div className="row wrap mt" style={{ justifyContent: "center" }}>
              <button className="btn primary" onClick={startAhead}>
                Ôn trước 10 thẻ
              </button>
              <Link className="btn ghost" to="/">
                Về trang tổng quan
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="review-wrap">
        <div className="review-top">
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>Ôn tập hàng ngày</h1>
            <div className="review-count">
              Còn {queue.length} thẻ trong lượt này · đã ôn {reviewed} · đến hạn hôm nay {dueNow}
              {ahead && " · đang ôn trước"}
            </div>
          </div>
          <Link className="btn ghost sm" to="/">
            Thoát
          </Link>
        </div>

        <div className="bar" style={{ height: 6, marginBottom: 16 }}>
          <span
            style={{ width: `${(reviewed / Math.max(1, reviewed + queue.length)) * 100}%` }}
          />
        </div>

        <div className="flashcard fade" key={current.id} onClick={() => setFlipped((f) => !f)}>
          <span className="chip fc-tag">
            {section ? `${section.num || ""} ${section.title}`.trim() : current.tag ?? "thẻ"}
          </span>
          <div className="fc-face">
            <div className="fc-front">
              <Markdown>{current.front}</Markdown>
            </div>
            {flipped && (
              <>
                <hr className="fc-divider" />
                <div className="fc-back">
                  <Markdown>{current.back}</Markdown>
                  {current.code && (
                    <Markdown>{`\`\`\`${current.lang ?? "cpp"}\n${current.code}\n\`\`\``}</Markdown>
                  )}
                </div>
              </>
            )}
          </div>
          {!flipped && <div className="fc-hint">Bấm vào thẻ để xem đáp án</div>}
        </div>

        {flipped ? (
          <div className="grade-row">
            {GRADES.map((it) => (
              <button
                key={it.g}
                className={"grade-btn " + it.cls}
                onClick={(e) => {
                  e.stopPropagation();
                  grade(it.g);
                }}
              >
                <span className="g-label">{it.label}</span>
                <span className="g-when">{previewInterval(srs, it.g)}</span>
              </button>
            ))}
          </div>
        ) : (
          <button className="btn primary block mt" onClick={() => setFlipped(true)}>
            Xem đáp án
          </button>
        )}

        {section && (
          <p className="fc-source">
            Nguồn:{" "}
            <Link to={`/lesson/${section.id}`}>
              {section.num ? `${section.num} · ` : ""}
              {section.title}
            </Link>
            {current.tag && ` · ${current.tag}`}
          </p>
        )}
      </div>
    </main>
  );
}
