import type { ReactNode } from "react";

export const VIBE_DETAIL_PREVIEW_CHARS = 520;
export const VIBE_DETAIL_PREVIEW_LINES = 8;
export const VIBE_FEED_PREVIEW_CHARS = 220;
export const VIBE_FEED_PREVIEW_LINES = 4;

function normalizeVibeSource(text: string): string {
  return text.replace(/\r\n|\r|\u2028|\u2029/g, "\n");
}

function isRuleLine(line: string): boolean {
  return /^(?:-{3,}|\*{3,}|_{3,})$/.test(line.trim());
}

function headingLevel(line: string): 2 | 3 | 0 {
  const t = line.trim();
  const match = t.match(/^(#{1,6})(.*)$/);
  if (!match) return 0;
  const marks = match[1];
  const rest = match[2];
  const title = rest.replace(/^\s+/, "").replace(/\s+#+\s*$/, "").trim();
  if (!title) return 0;
  if (marks.length === 1 && !/^\s+/.test(rest)) return 0;
  return marks.length >= 3 ? 3 : 2;
}

function stripHeadingMarks(line: string): string {
  return line
    .trim()
    .replace(/^#{1,6}\s*/, "")
    .replace(/\s+#+\s*$/, "")
    .trim();
}

function renderInline(text: string, keyPrefix: string): ReactNode {
  const nodes: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    nodes.push(
      <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-white">
        {match[1]}
      </strong>
    );
    i += 1;
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes.length === 1 ? nodes[0] : nodes;
}

export function isLongVibeText(
  text: string,
  maxChars: number,
  maxLines: number
): boolean {
  if (!text) return false;
  const normalized = normalizeVibeSource(text);
  const lines = normalized.split("\n");
  return normalized.length > maxChars || lines.length > maxLines;
}

export function vibePlainPreview(text: string, max = 140): string {
  const clean = normalizeVibeSource(text)
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^(?:-{3,}|\*{3,}|_{3,})$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function VibeRichText({
  text,
  variant = "feed",
  clamped = false,
  clampLines = 4,
}: {
  text: string;
  variant?: "feed" | "article";
  clamped?: boolean;
  clampLines?: number;
}) {
  const article = variant === "article";
  const lines = normalizeVibeSource(text).split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let blockIndex = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const body = paragraph.join("\n");
    const key = `p-${blockIndex}`;
    blockIndex += 1;
    paragraph = [];
    blocks.push(
      <p
        key={key}
        className={
          article
            ? "whitespace-pre-wrap text-[17px] leading-[1.8] text-gray-100"
            : "whitespace-pre-wrap text-sm leading-7 text-gray-100"
        }
      >
        {renderInline(body, key)}
      </p>
    );
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/g, "");
    const level = headingLevel(line);
    if (level) {
      flushParagraph();
      const key = `h-${blockIndex}`;
      blockIndex += 1;
      const Tag = level === 2 ? "h2" : "h3";
      const label = stripHeadingMarks(line);
      if (!label) continue;
      blocks.push(
        <Tag
          key={key}
          className={
            level === 2
              ? article
                ? "text-[1.15rem] font-semibold leading-snug tracking-tight text-white sm:text-[1.35rem]"
                : "text-sm font-semibold leading-6 text-white"
              : article
                ? "text-[1.05rem] font-semibold leading-snug text-white sm:text-[1.15rem]"
                : "text-sm font-semibold leading-6 text-white"
          }
        >
          {renderInline(label, key)}
        </Tag>
      );
      continue;
    }
    if (isRuleLine(line)) {
      flushParagraph();
      blocks.push(
        <hr
          key={`hr-${blockIndex}`}
          className={
            article
              ? "border-0 border-t border-[#FBB03B]/20"
              : "border-0 border-t border-white/15"
          }
        />
      );
      blockIndex += 1;
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();

  return (
    <div
      className={
        article
          ? `vibe-article min-w-0 max-w-none break-words sm:max-w-prose ${
              clamped ? "" : "space-y-4 sm:space-y-5"
            }`
          : clamped
            ? "min-w-0 break-words"
            : "min-w-0 space-y-2 break-words"
      }
      style={
        clamped
          ? {
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: clampLines,
              overflow: "hidden",
            }
          : undefined
      }
    >
      {blocks}
    </div>
  );
}
