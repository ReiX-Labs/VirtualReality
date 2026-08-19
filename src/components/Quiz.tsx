import { useState } from "react";
import type { QuizQuestion } from "../data/quizzes";
import Markdown from "./Markdown";
import ProgressRing from "./ProgressRing";

const LETTERS = ["A", "B", "C", "D", "E"];

interface Props {
  questions: QuizQuestion[];
  onComplete?: (score: number) => void;
}

export default function Quiz({ questions, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[index];
  const isLast = index === questions.length - 1;

  const pick = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    if (i === q.answer) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (isLast) {
      const score = correct / questions.length;
      setDone(true);
      onComplete?.(score);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setCorrect(0);
    setDone(false);
  };

  if (done) {
    const score = correct / questions.length;
    const pct = Math.round(score * 100);
    const good = score >= 0.7;
    return (
      <div className="result fade">
        <ProgressRing
          value={score}
          size={140}
          label={`${pct}%`}
          sub={`${correct}/${questions.length}`}
          color={good ? "var(--success)" : "var(--warning)"}
        />
        <h3>{good ? "Làm tốt lắm! 🎉" : "Ổn — ôn lại chút nhé 💪"}</h3>
        <p>
          {good
            ? "Bạn đã nắm chắc phần này. Tiếp tục sang bài kế tiếp!"
            : "Xem lại phần Bài học rồi thử lại — mỗi lần làm bạn sẽ nhớ lâu hơn."}
        </p>
        <button className="btn primary" onClick={restart}>
          ↻ Làm lại
        </button>
      </div>
    );
  }

  return (
    <div className="fade" key={index}>
      <div className="quiz-head">
        <div className="quiz-progress">
          Câu {index + 1} / {questions.length}
        </div>
        <div className="bar" style={{ width: 140 }}>
          <span style={{ width: `${((index + (revealed ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="question">{q.q}</div>
      {q.code && (
        <div className="q-code">
          <Markdown>{"```" + (q.lang ?? "") + "\n" + q.code + "\n```"}</Markdown>
        </div>
      )}

      <div className="choices">
        {q.choices.map((choice, i) => {
          let cls = "choice";
          if (revealed) {
            if (i === q.answer) cls += " correct";
            else if (i === selected) cls += " wrong";
          }
          return (
            <button key={i} className={cls} onClick={() => pick(i)} disabled={revealed}>
              <span className="letter">{LETTERS[i]}</span>
              <span>{choice}</span>
            </button>
          );
        })}
      </div>

      {revealed && q.explain && (
        <div className="explain fade">
          <b>{selected === q.answer ? "Chính xác. " : "Giải thích: "}</b>
          {q.explain}
        </div>
      )}

      <div className="quiz-actions">
        {revealed && (
          <button className="btn primary" onClick={next}>
            {isLast ? "Xem kết quả →" : "Câu tiếp theo →"}
          </button>
        )}
      </div>
    </div>
  );
}
