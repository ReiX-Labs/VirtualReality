import { memo, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";

/** Extract plain text from arbitrary react children (for heading ids). */
export function nodeText(children: ReactNode): string {
  if (children == null || children === false) return "";
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(nodeText).join("");
  if (typeof children === "object" && "props" in (children as any)) {
    return nodeText((children as any).props?.children);
  }
  return "";
}

/** Slug used for in-page heading anchors (kept consistent for the TOC). */
export function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function Heading({ level, children }: { level: 2 | 3 | 4; children: ReactNode }) {
  const id = headingSlug(nodeText(children));
  const Tag = (`h${level}` as unknown) as "h2";
  return <Tag id={id}>{children}</Tag>;
}

interface Props {
  children: string;
}

/** Renders markdown with GFM tables, syntax highlighting, raw <details> and anchored headings. */
function MarkdownBase({ children }: Props) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // detect:false on purpose — this document is full of unlabelled ASCII
        // diagrams (OSI stack, STUN header, ICE flow). Auto-detection would
        // colour them like source code and make them harder to read.
        rehypePlugins={[rehypeRaw, [rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        components={{
          h1: ({ children }) => <Heading level={2}>{children}</Heading>,
          h2: ({ children }) => <Heading level={2}>{children}</Heading>,
          h3: ({ children }) => <Heading level={3}>{children}</Heading>,
          h4: ({ children }) => <Heading level={4}>{children}</Heading>,
          a: ({ href, children }) => {
            // In-page anchors: scroll manually so they don't clash with HashRouter.
            if (href?.startsWith("#")) {
              return (
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(href.slice(1));
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  {children}
                </a>
              );
            }
            return (
              <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export const Markdown = memo(MarkdownBase);
export default Markdown;
