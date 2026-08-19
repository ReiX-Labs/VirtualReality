import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reference } from "../content/reference";
import { labs } from "../labs";
import { actions, useStore } from "../lib/store";

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

const appendixIds = new Set(reference.appendixSections.map((s) => s.id));

type Hit =
  | { kind: "section"; id: string; title: string; sub: string; score: number }
  | { kind: "lab"; id: string; title: string; sub: string; score: number };

interface Props {
  onMenu: () => void;
}

export default function Topbar({ onMenu }: Props) {
  const state = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<number>();
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses search from anywhere, like every docs site worth using.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") inputRef.current?.blur();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo<Hit[]>(() => {
    const query = norm(q.trim());
    if (query.length < 2) return [];

    const sectionHits: Hit[] = [];
    for (const s of reference.sections) {
      const inTitle = norm(s.title).includes(query);
      const inBody = norm(s.body).includes(query);
      if (!inTitle && !inBody) continue;
      sectionHits.push({
        kind: "section",
        id: s.id,
        title: (s.num ? `${s.num} · ` : "") + s.title,
        sub: s.partTitle,
        score: inTitle ? 3 : 1,
      });
    }

    const labHits: Hit[] = labs
      .filter((l) => norm(l.title + " " + l.blurb + " " + l.goal).includes(query))
      .map((l) => ({ kind: "lab", id: l.id, title: `${l.icon} ${l.title}`, sub: "Lab tương tác", score: 2 }));

    return [...sectionHits, ...labHits].sort((a, b) => b.score - a.score).slice(0, 8);
  }, [q]);

  const go = (hit: Hit) => {
    setQ("");
    setFocused(false);
    if (hit.kind === "lab") navigate(`/labs#lab-${hit.id}`);
    else if (appendixIds.has(hit.id)) navigate(`/reference?tab=${hit.id}`);
    else navigate(`/lesson/${hit.id}`);
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Mở menu">
          ☰
        </button>

        <div className="search">
          <span className="search-ico">⌕</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              blurTimer.current = window.setTimeout(() => setFocused(false), 150);
            }}
            placeholder="Tìm bài học, thiết lập, bẫy, lab…  ( / )"
            aria-label="Tìm kiếm"
          />
          {focused && q.trim().length >= 2 && (
            <div
              className="search-results"
              onMouseDown={() => window.clearTimeout(blurTimer.current)}
            >
              {results.length === 0 ? (
                <div className="search-empty">Không tìm thấy kết quả cho “{q}”.</div>
              ) : (
                results.map((hit) => (
                  <a key={hit.kind + hit.id} className="search-result" onClick={() => go(hit)}>
                    <div className="sr-title">{hit.title}</div>
                    <div className="sr-part">{hit.sub}</div>
                  </a>
                ))
              )}
            </div>
          )}
        </div>

        <div className="topbar-stats">
          <span className="pill streak" title="Chuỗi ngày học liên tiếp">
            <span className="ico">🔥</span>
            {state.streak.count} ngày
          </span>
          <span className="pill xp" title="Điểm kinh nghiệm">
            <span className="ico">✦</span>
            {state.xp} XP
          </span>
          <button
            className="icon-btn"
            title="Đổi giao diện sáng/tối"
            onClick={() => actions.setTheme(state.theme === "dark" ? "light" : "dark")}
          >
            {state.theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </div>
    </header>
  );
}
