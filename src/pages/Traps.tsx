import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Markdown from "../components/Markdown";
import { reference } from "../content/reference";
import { useStore } from "../lib/store";

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

export default function Traps() {
  const state = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const traps = reference.trapSections;
  const nq = norm(q.trim());

  const shown = useMemo(
    () => (nq ? traps.filter((s) => norm(s.title + " " + s.body).includes(nq)) : traps),
    [nq, traps]
  );

  return (
    <main className="page wide">
      <div className="page-head">
        <h1>Sổ tay bẫy thực địa</h1>
        <p className="muted">
          {traps.length} mục lấy thẳng từ giáo án — mỗi mục là một lỗi từng làm mất nguyên buổi
          chiều của ai đó. Đọc trước khi làm, hoặc tra khi đang kẹt. Dùng ô tìm kiếm bên dưới với
          triệu chứng bạn đang gặp (“màn hình đen”, “adb”, “nhoè chữ”…).
        </p>
        <input
          className="ex-link-input"
          style={{ maxWidth: 520, marginTop: 14 }}
          placeholder="Tìm theo triệu chứng hoặc từ khoá…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <div className="emoji">🔍</div>
          <h3>Không có mục bẫy nào khớp “{q}”</h3>
          <p>Thử một từ khoá ngắn hơn, hoặc dùng ô tìm kiếm toàn tài liệu ở thanh trên.</p>
        </div>
      ) : (
        <div className="lab-list">
          {shown.map((s) => {
            const isOpen = open === s.id;
            const read = !!state.progress[s.id]?.read;
            const part = reference.parts.find((p) => p.id === s.partId);
            return (
              <div key={s.id} className={"card lab-panel" + (isOpen ? " open" : "")}>
                <button
                  className="lab-panel-head"
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  aria-expanded={isOpen}
                >
                  <span className="lp-icon">🪤</span>
                  <span className="lp-text">
                    <span className="lp-title">
                      {s.num ? `${s.num} · ` : ""}
                      {s.title}
                      {read && <span className="lp-done">✓ đã đọc</span>}
                    </span>
                    <span className="lp-blurb">
                      {part?.label}
                      {part && " — "}
                      {part?.name}
                      {s.marks.warn > 0 && ` · ⚠️ ${s.marks.warn}`}
                      {s.marks.unknown > 0 && ` · ❓ ${s.marks.unknown}`}
                    </span>
                  </span>
                  <span className="lp-chev">{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <div className="lab-panel-body fade">
                    <Markdown>{s.body}</Markdown>
                    <div className="lp-links">
                      <Link
                        className="chip link"
                        to={part?.isAppendix ? `/reference?tab=${s.id}` : `/lesson/${s.id}`}
                      >
                        {part?.isAppendix
                          ? "Mở trong phụ lục →"
                          : "Mở trong bài học (có quiz & thẻ ôn) →"}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
