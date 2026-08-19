import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Markdown from "../components/Markdown";
import { reference } from "../content/reference";
import { cardIds } from "../data/cards";
import { QUIZZES } from "../data/quizzes";
import { exercises } from "../content/exercises";
import { labs } from "../labs";
import { actions, useStore } from "../lib/store";

export default function ReferencePage() {
  const state = useStore();
  const [params, setParams] = useSearchParams();
  const parts = reference.appendixParts;

  const wanted = params.get("tab") ?? "";
  const bySection = reference.byId[wanted];
  const initial =
    parts.find((p) => p.id === wanted)?.id ??
    (bySection ? parts.find((p) => p.id === bySection.partId)?.id : undefined) ??
    parts[0]?.id ??
    "";

  const [tab, setTab] = useState(initial);
  const part = parts.find((p) => p.id === tab) ?? parts[0];

  // Deep links from the top-bar search point at a section, not a tab.
  useEffect(() => {
    if (!wanted) return;
    const target = reference.byId[wanted];
    const partId = parts.find((p) => p.id === wanted)?.id ?? (target ? target.partId : undefined);
    if (partId) setTab(partId);
    if (!target) return;
    const t = window.setTimeout(() => {
      document.getElementById(`sec-${target.id}`)?.scrollIntoView({ behavior: "smooth" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [wanted, parts]);

  const pick = (id: string) => {
    setTab(id);
    setParams(id === parts[0]?.id ? {} : { tab: id }, { replace: true });
  };

  const readCount = reference.lessonSections.filter((s) => state.progress[s.id]?.read).length;
  const labsDone = labs.filter((l) => state.labsDone[l.id]).length;
  const exDone = exercises.filter((e) => state.exercises[e.id]?.done).length;
  const seen = cardIds.filter((id) => state.srs[id]?.introduced).length;

  return (
    <main className="page wide">
      <div className="page-head">
        <h1>Phụ lục &amp; Tra cứu</h1>
        <p className="muted">
          Phần tra nhanh của giáo án: lệnh, cấu hình, nguồn chính thức và những gì bạn phải tự xác
          nhận trên máy mình. Không cần học thuộc — cần thì mở ra.
        </p>
      </div>

      <div className="tabs ref-tabs">
        {parts.map((p) => (
          <button
            key={p.id}
            className={"tab" + (p.id === tab ? " active" : "")}
            onClick={() => pick(p.id)}
          >
            {p.label}
            <span className="badge muted">{p.sections.length}</span>
          </button>
        ))}
      </div>

      {part && (
        <div className="card pad fade" key={part.id}>
          <h2 className="section-title" style={{ marginTop: 0 }}>
            {part.name}
          </h2>

          {part.intro && <Markdown>{part.intro}</Markdown>}

          {part.sections.map((s) => (
            <section key={s.id} id={`sec-${s.id}`} style={{ scrollMarginTop: 80 }}>
              <h2 style={{ fontSize: 19, marginTop: 30 }}>
                {s.num ? `${s.num} · ` : ""}
                {s.title}
              </h2>
              <Markdown>{s.body}</Markdown>
            </section>
          ))}
        </div>
      )}

      <div className="grid mt-lg" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <div className="card pad">
          <h2 className="section-title" style={{ marginTop: 0 }}>
            Tài liệu gốc
          </h2>
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.65 }}>
            Toàn bộ trang này được dựng thẳng từ một file markdown duy nhất —{" "}
            <code>GiaoAn_VR_UE56_Quest3.md</code>. Ba nhãn tin cậy trong tài liệu: <b>✅</b> đã đối
            chiếu tài liệu chính thức của Epic/Meta, <b>⚠️</b> nguồn cộng đồng hoặc chung chung,{" "}
            <b>❓</b> chưa xác minh — bạn phải tự đo trên máy.
          </p>
          <div className="data-stats mt">
            <span>
              <b>{reference.parts.length}</b> chương &amp; phụ lục
            </span>
            <span>
              <b>{reference.sections.length}</b> mục
            </span>
            <span>
              <b>{QUIZZES.length}</b> câu hỏi
            </span>
            <span>
              <b>{cardIds.length}</b> thẻ ôn
            </span>
          </div>
          <Link className="btn ghost block mt" to="/traps">
            🪤 Sổ tay bẫy ({reference.trapSections.length} mục)
          </Link>
        </div>

        <div className="card pad">
          <h2 className="section-title" style={{ marginTop: 0 }}>
            Dữ liệu học tập của bạn
          </h2>
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.65 }}>
            Mọi tiến độ được lưu ngay trong trình duyệt này (localStorage) — không có tài khoản,
            không gửi đi đâu cả. Xoá dữ liệu trình duyệt là mất tiến độ.
          </p>
          <div className="data-stats mt">
            <span>
              <b>{readCount}</b> bài đã học
            </span>
            <span>
              <b>{seen}</b> thẻ đã gặp
            </span>
            <span>
              <b>{labsDone}</b> lab
            </span>
            <span>
              <b>{exDone}</b> bài tập
            </span>
            <span>
              <b>{state.xp}</b> XP
            </span>
          </div>
          <button
            className="btn ghost block mt"
            onClick={() => {
              if (confirm("Xoá toàn bộ tiến độ học tập? Không thể hoàn tác.")) actions.resetAll();
            }}
          >
            Xoá toàn bộ tiến độ
          </button>
        </div>
      </div>
    </main>
  );
}
