// Single source of truth: the giáo án at the repo root.
// Swap that file (keep the same heading shape) and the whole site updates.
import raw from "../../GiaoAn_VR_UE56_Quest3.md?raw";
import { parseReference } from "./parse";

export const reference = parseReference(raw);
export const rawMarkdown = raw;
