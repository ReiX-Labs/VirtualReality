import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { reference } from "../content/reference";
import { cardIds } from "../data/cards";
import { labsBySection } from "../labs";
import { useStore } from "../lib/store";
import { startOfDay } from "../lib/srs";

function countDue(srs: Record<string, { due: number }>): number {
  const today = startOfDay();
  return cardIds.filter((id) => {
    const c = srs[id];
    return !c || c.due <= today;
  }).length;
}

export default function Sidebar() {
  const state = useStore();
  const { id: activeId } = useParams();
  const location = useLocation();

  const activePartId = useMemo(() => reference.byId[activeId ?? ""]?.partId, [activeId]);

  const [open, setOpen] = useState<Set<string>>(
    () => new Set(activePartId ? [activePartId] : reference.lessonParts.slice(0, 2).map((p) => p.id)),
  );

  useEffect(() => {
    if (activePartId) {
      setOpen((prev) => (prev.has(activePartId) ? prev : new Set(prev).add(activePartId)));
    }
  }, [activePartId]);

  const due = countDue(state.srs);
  const lessons = reference.lessonSections;
  const totalSections = lessons.length;
  const totalRead = lessons.filter((s) => state.progress[s.id]?.read).length;

  const toggle = (pid: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">
          <span className="logo-net">◎</span>
        </div>
        <div>
          <div className="brand-name">XRLab</div>
          <div className="brand-sub">ReiX Labs · VR trên Quest 3</div>
        </div>
      </div>

      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <span className="nav-ico">◈</span> Tổng quan
        </NavLink>
        <NavLink to="/labs" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <span className="nav-ico">⚗</span> Lab tương tác
        </NavLink>
        <NavLink to="/review" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <span className="nav-ico">↻</span> Ôn tập hàng ngày
          {due > 0 && <span className="badge">{due}</span>}
        </NavLink>
        <NavLink
          to="/exercises"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          <span className="nav-ico">⌨</span> Lộ trình 7 tuần
        </NavLink>
        <NavLink to="/traps" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <span className="nav-ico">⚠</span> Sổ tay bẫy
          <span className="badge soft">{reference.trapSections.length}</span>
        </NavLink>
        <NavLink
          to="/reference"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          <span className="nav-ico">☰</span> Phụ lục &amp; Tra cứu
        </NavLink>
      </nav>

      <div className="nav-title">Chương trình học</div>
      <div className="tree">
        {reference.lessonParts.map((part) => {
          const isOpen = open.has(part.id);
          const readInPart = part.sections.filter((s) => state.progress[s.id]?.read).length;
          const allRead = part.sections.length > 0 && readInPart === part.sections.length;
          return (
            <div className="part" key={part.id}>
              <div
                className={"part-head" + (isOpen ? " open" : "")}
                onClick={() => toggle(part.id)}
              >
                <span className="chev">▶</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="part-label">
                    {part.label}
                    {part.week !== null && (
                      <span className="week-chip" title={`Theo lộ trình: tuần ${part.week}`}>
                        T{part.week}
                      </span>
                    )}
                    {part.marks.unknown > 0 && (
                      <span
                        className="trust-dot"
                        title={`${part.marks.unknown} chỗ đánh dấu ❓ — bạn cần tự kiểm chứng trên máy`}
                      >
                        ❓
                      </span>
                    )}
                  </div>
                  <div className="part-title">{part.name}</div>
                </div>
                <span className={"part-progress" + (allRead ? " done" : "")}>
                  {readInPart}/{part.sections.length}
                </span>
              </div>
              {isOpen && (
                <div className="section-list">
                  {part.sections.map((s) => {
                    const done = state.progress[s.id]?.read;
                    const isActive = location.pathname === `/lesson/${s.id}`;
                    const hasLab = !!labsBySection[s.id];
                    return (
                      <NavLink
                        key={s.id}
                        to={`/lesson/${s.id}`}
                        className={
                          "section-link" +
                          (isActive ? " active" : "") +
                          (done ? " done" : "") +
                          (s.isTrap ? " trap" : "")
                        }
                      >
                        <span className="section-num">{s.num || "•"}</span>
                        <span className="section-name">{s.title}</span>
                        {hasLab && (
                          <span className="lab-dot" title="Có lab tương tác">
                            ⚗
                          </span>
                        )}
                        <span className="tick">{done ? "✓" : ""}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sidebar-foot">
        <div
          className="row spread"
          style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 6 }}
        >
          <span>Tiến độ tổng</span>
          <span>
            {totalRead}/{totalSections}
          </span>
        </div>
        <div className="bar success">
          <span style={{ width: `${totalSections ? (totalRead / totalSections) * 100 : 0}%` }} />
        </div>
      </div>
    </aside>
  );
}
