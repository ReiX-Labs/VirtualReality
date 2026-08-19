// Parses the giáo án markdown into a structured Chapters -> Sections tree.
//
// The whole site is driven by this. When you swap the giáo án document, the
// navigation, lessons and reading content all update automatically — as long
// as the doc keeps the same simple shape:
//
//   # Giáo án VR/MR trên Unreal Engine 5.6…   <- first H1 = document title
//   **Thiết bị mục tiêu:** Meta Quest 3…      <- front matter (key: value)
//   ## Cách dùng tài liệu này                 <- H2 before any chapter
//   # Chương 3 — Baseline Quest 3             <- H1 = a "Chapter"
//   ## 3.6 Renderer: Forward + Vulkan…        <- H2 = a "Section" (one lesson)
//   ### Ẩn dụ…                                <- H3 = sub-heading (in-page TOC)
//   ...body...
//   # Phụ lục A — Sổ tay bẫy thực địa         <- H1 "Phụ lục" = reference material
//   ## A.1 Bẫy hạ tầng
//
// Chapters named "Phụ lục" are treated as reference material and shown on the
// "Tra cứu" page instead of the sequential curriculum.
//
// Headings inside ``` fenced code blocks are ignored on purpose — this document
// is full of C++/ini snippets whose comments start with "#".

export interface Marks {
  /** ✅ verified against Epic/Meta official docs */
  ok: number;
  /** ⚠️ community source, or written for "UE 5" generally */
  warn: number;
  /** ❓ unverified — the reader must test it themselves */
  unknown: number;
}

export interface Section {
  /** stable id used in routes, e.g. "3-6", "a-1", "c-3b" */
  id: string;
  /** the visible section number, e.g. "3.6", "A.1" (empty if none) */
  num: string;
  /** heading text without the number prefix and leading emoji */
  title: string;
  /** raw markdown body of this section (no heading line) */
  body: string;
  /** id of the parent chapter */
  partId: string;
  /** short chapter label like "CHƯƠNG 3" */
  partTitle: string;
  /** the descriptive chapter name */
  partName: string;
  /** rough reading time in minutes */
  minutes: number;
  /** number of fenced code blocks in the body */
  codeBlocks: number;
  /** how many ✅ / ⚠️ / ❓ claims the section carries */
  marks: Marks;
  /** true when the body has a "- [ ]" gate checklist */
  hasChecklist: boolean;
  /** true for the "Bẫy của chương này" pitfall tables */
  isTrap: boolean;
  /** true for the "Bài tập…" practice sections */
  isPractice: boolean;
}

export interface Part {
  id: string;
  title: string;
  /** short label like "CHƯƠNG 3" */
  label: string;
  /** the descriptive chapter name without the "Chương X —" prefix */
  name: string;
  /** markdown between the chapter heading and its first section */
  intro: string;
  /** true for reference chapters (Phụ lục A…D) */
  isAppendix: boolean;
  /** which week of the roadmap this chapter belongs to (null for appendices) */
  week: number | null;
  sections: Section[];
  marks: Marks;
}

export interface Reference {
  title: string;
  subtitle: string;
  /** front-matter pairs from the top of the document */
  meta: { key: string; value: string }[];
  parts: Part[];
  /** every parsed section, incl. appendices (used for global search) */
  sections: Section[];
  /** only the sequential lessons, excluding appendices */
  lessonSections: Section[];
  /** sequential lesson chapters only (the curriculum) */
  lessonParts: Part[];
  /** reference chapters (Phụ lục…) shown on the "Tra cứu" page */
  appendixParts: Part[];
  /** all appendix sections in document order */
  appendixSections: Section[];
  /** every "Bẫy của chương này" section — the field pitfall handbook */
  trapSections: Section[];
  byId: Record<string, Section>;
}

/**
 * Which week of the 7-week plan each chapter falls in, straight from the
 * "Lộ trình" table at the top of the document.
 */
const CHAPTER_WEEK: Record<number, number> = {
  0: 0,
  1: 0,
  2: 1,
  3: 1,
  4: 2,
  5: 3,
  6: 4,
  7: 5,
  8: 6,
  9: 6,
  10: 6,
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** One emoji / symbol glyph, including surrogate pairs and variation selectors. */
const GLYPH = "(?:[\\u2190-\\u2BFF\\uFE0F\\u200D]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF])";

/** Drop leading emoji / warning glyphs so headings read cleanly in the nav. */
function stripLeadingGlyphs(s: string): string {
  return s.replace(new RegExp(`^(?:${GLYPH}|\\s)+`), "").trim();
}

/** Drop trailing badge glyphs — they become the `marks` counts instead. */
function stripTrailingGlyphs(s: string): string {
  return s.replace(new RegExp(`(?:${GLYPH}|\\s)+$`), "").trim();
}

/**
 * Reading time: prose at ~170 words/minute, plus a slower pass over code and
 * ASCII diagrams (~8 lines/minute) since those are read line by line.
 */
function estimateMinutes(text: string): number {
  const fenced = text.match(/^```[\s\S]*?^```/gm) ?? [];
  const codeLines = fenced.reduce((n, block) => n + block.split("\n").length, 0);
  const prose = text.replace(/^```[\s\S]*?^```/gm, " ");
  const words = prose.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 170 + codeLines / 8));
}

function countCodeBlocks(text: string): number {
  const fences = text.match(/^```/gm);
  return fences ? Math.floor(fences.length / 2) : 0;
}

function countMarks(text: string): Marks {
  const n = (re: RegExp) => (text.match(re) ?? []).length;
  return {
    ok: n(/✅/g), // ✅
    warn: n(/⚠/g), // ⚠️
    unknown: n(/❓/g), // ❓
  };
}

function addMarks(a: Marks, b: Marks): Marks {
  return { ok: a.ok + b.ok, warn: a.warn + b.warn, unknown: a.unknown + b.unknown };
}

/** Split an H2 section heading into a number + clean title. */
function splitHeading(raw: string): { num: string; title: string } {
  const clean = stripLeadingGlyphs(raw);
  const tidy = (s: string) => stripTrailingGlyphs(stripLeadingGlyphs(s));
  // "3.6 Renderer: Forward + Vulkan"  /  "10.1 Vì sao chương này tồn tại"
  const numeric = clean.match(/^(\d+(?:\.\d+)*)\.?\s+(.*)$/);
  if (numeric) return { num: numeric[1], title: tidy(numeric[2]) };
  // Appendix numbering: "A.1 Bẫy hạ tầng", "C.3b Meta — hand tracking"
  const alpha = clean.match(/^([A-Z]\.\d+[a-z]?)\.?\s+(.*)$/);
  if (alpha) return { num: alpha[1], title: tidy(alpha[2]) };
  return { num: "", title: tidy(clean) };
}

/** "Chương 3 — Baseline Quest 3" -> "CHƯƠNG 3" */
function partLabel(heading: string): string {
  const ch = heading.match(/^(Chương\s+\d+)/i);
  if (ch) return ch[1].toUpperCase();
  const ap = heading.match(/^(Phụ lục\s+[A-Z])/i);
  if (ap) return ap[1].toUpperCase();
  const dash = heading.split(/\s*[—–]\s*/)[0].trim();
  return (dash || heading).trim().toUpperCase();
}

function partName(heading: string): string {
  const bits = heading.split(/\s*[—–]\s*/);
  return (bits.slice(1).join(" — ") || bits[0] || heading).trim();
}

function chapterNumber(heading: string): number | null {
  const m = heading.match(/^Chương\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

/**
 * Tidy a section body before it reaches the renderer:
 *  - the document separates chapters with "---\n---", which would render as
 *    two stray rules at the end of every last section;
 *  - the hand-written "### Mục lục" duplicates the sidebar and its anchors
 *    (#chương-0--…) point at ids this app never creates.
 */
function cleanBody(text: string): string {
  let out = text.replace(/(?:^\s*---\s*$\n?)+$/m, "").trimEnd();
  // Cut the hand-written TOC: up to the next H3, or to the end of the section
  // when it is the last sub-heading (which is the case today).
  out = out.replace(/^###\s+Mục lục[\s\S]*?(?=^###\s)/m, "");
  out = out.replace(/^###\s+Mục lục[\s\S]*$/m, "");
  return out.trim();
}

/** Read the "**Key:** value" front-matter block at the top of the document. */
function readMeta(lines: string[]): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = [];
  for (const line of lines) {
    const m = line.match(/^\*\*(.+?):?\*\*\s*(.+)$/);
    if (m) out.push({ key: m[1].replace(/:$/, "").trim(), value: m[2].trim() });
  }
  return out;
}

export function parseReference(raw: string): Reference {
  const lines = raw.split(/\r?\n/);

  let title = "Giáo án VR/MR trên Unreal Engine 5.6";
  let seenTitle = false;
  let inFence = false;

  const parts: Part[] = [];
  let currentPart: Part | null = null;

  // section accumulation
  let secHeading: string | null = null;
  let secBuf: string[] = [];
  // lines between a chapter heading and its first section
  let introBuf: string[] = [];
  // lines between the H1 title and the first H2 — the front matter
  const frontBuf: string[] = [];

  const emptyMarks = (): Marks => ({ ok: 0, warn: 0, unknown: 0 });

  /** Everything before the first "# Chương …" lands in this synthetic chapter. */
  const openingPart = (): Part => {
    if (parts.length === 0 || parts[0].id !== "mo-dau") {
      const p: Part = {
        id: "mo-dau",
        title: "MỞ ĐẦU — Cách dùng giáo án",
        label: "MỞ ĐẦU",
        name: "Cách dùng giáo án này",
        intro: "",
        isAppendix: false,
        week: 0,
        sections: [],
        marks: emptyMarks(),
      };
      parts.unshift(p);
      return p;
    }
    return parts[0];
  };

  const pushSection = () => {
    if (secHeading == null || !currentPart) {
      secHeading = null;
      secBuf = [];
      return;
    }
    const { num, title: secTitle } = splitHeading(secHeading);
    const body = cleanBody(secBuf.join("\n"));
    const id = num ? num.replace(/\./g, "-").toLowerCase() : slugify(secTitle);
    currentPart.sections.push({
      id,
      num,
      title: secTitle,
      body,
      partId: currentPart.id,
      partTitle: currentPart.label,
      partName: currentPart.name,
      minutes: estimateMinutes(body),
      codeBlocks: countCodeBlocks(body),
      marks: countMarks(body),
      hasChecklist: /^\s*- \[ \]/m.test(body),
      isTrap: /^bẫy\b/i.test(secTitle),
      isPractice: /^bài tập/i.test(secTitle),
    });
    secHeading = null;
    secBuf = [];
  };

  /** Close the chapter we were filling and stash its intro. */
  const closePart = () => {
    if (!currentPart) return;
    currentPart.intro = cleanBody(introBuf.join("\n"));
    currentPart.marks = currentPart.sections.reduce(
      (acc, s) => addMarks(acc, s.marks),
      countMarks(currentPart.intro),
    );
    introBuf = [];
  };

  const startPart = (heading: string) => {
    pushSection();
    closePart();
    const label = partLabel(heading);
    const isAppendix = /^phụ lục/i.test(heading);
    const chNum = chapterNumber(heading);
    currentPart = {
      id: slugify(label) || slugify(heading),
      title: heading.trim(),
      label,
      name: partName(heading),
      intro: "",
      isAppendix,
      week: chNum != null ? (CHAPTER_WEEK[chNum] ?? null) : null,
      sections: [],
      marks: emptyMarks(),
    };
    parts.push(currentPart);
  };

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      if (secHeading != null) secBuf.push(line);
      else if (currentPart) introBuf.push(line);
      continue;
    }

    if (!inFence && /^#\s+/.test(line)) {
      const heading = line.replace(/^#\s+/, "").trim();
      if (!seenTitle) {
        title = heading;
        seenTitle = true;
        continue;
      }
      startPart(heading);
      continue;
    }

    if (!inFence && /^##\s+/.test(line)) {
      const heading = line.replace(/^##\s+/, "").trim();
      pushSection();
      // Any H2 before the first "# Chương …" joins the synthetic opening chapter.
      if (!currentPart) currentPart = openingPart();
      secHeading = heading;
      secBuf = [];
      continue;
    }

    if (secHeading != null) secBuf.push(line);
    else if (currentPart) introBuf.push(line);
    else if (seenTitle) frontBuf.push(line);
  }
  pushSection();
  closePart();

  // Drop chapters that ended up with no sections.
  const kept = parts.filter((p) => p.sections.length > 0);

  const meta = readMeta(frontBuf);
  const device = meta.find((m) => /thiết bị/i.test(m.key))?.value ?? "Meta Quest 3";
  const engine = meta.find((m) => /engine/i.test(m.key))?.value ?? "Unreal Engine 5.6";

  const sections = kept.flatMap((p) => p.sections);
  const lessonParts = kept.filter((p) => !p.isAppendix);
  const appendixParts = kept.filter((p) => p.isAppendix);
  const lessonSections = lessonParts.flatMap((p) => p.sections);
  const appendixSections = appendixParts.flatMap((p) => p.sections);
  const trapSections = sections.filter((s) => s.isTrap);
  const byId: Record<string, Section> = {};
  for (const s of sections) byId[s.id] = s;

  return {
    title,
    subtitle: `${engine.split("(")[0].trim()} · ${device.split("(")[0].trim()}`,
    meta,
    parts: kept,
    sections,
    lessonSections,
    lessonParts,
    appendixParts,
    appendixSections,
    trapSections,
    byId,
  };
}
