import { Fragment } from "react";

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`)/g;

/**
 * Bold + inline code only. Used where a full <Markdown> block would drag in
 * paragraph rhythm we don't want (checklist items, lab goals, chips).
 */
export default function InlineMd({ text }: { text: string }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code key={i} className="icode">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
