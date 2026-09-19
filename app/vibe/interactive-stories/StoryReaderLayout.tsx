import type { CSSProperties, ReactNode } from "react";

export const STORY_READER_MAX_WIDTH = 760;

export const storyReaderColumnStyle: CSSProperties = {
  width: "100%",
  maxWidth: STORY_READER_MAX_WIDTH,
  marginInline: "auto",
};

export const STORY_BODY_TEXT_CLASS =
  "w-full font-serif text-[17px] leading-8 text-gray-100 sm:text-[18px] sm:leading-9";

export const STORY_INTRO_TEXT_CLASS =
  "w-full text-[17px] leading-8 text-gray-300 sm:text-[18px] sm:leading-9";

export const STORY_CHOICE_LABEL_CLASS = "min-w-0 text-[17px] leading-7 text-gray-100";

export const STORY_CHOICE_BUTTON_CLASS =
  "flex min-h-14 w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#020817] px-4 py-3.5 text-left transition hover:border-[#FBB03B]/60 hover:bg-[#111827]";

/** 16px gutters for every Interactive Stories page. */
export function StoryReaderPage({ children }: { children: ReactNode }) {
  return <div className="w-full min-w-0 px-4 py-4 sm:py-6">{children}</div>;
}

export default function StoryReaderLayout({
  children,
  framed = true,
  className = "",
}: {
  children: ReactNode;
  framed?: boolean;
  className?: string;
}) {
  return (
    <div
      data-story-reader=""
      className={
        framed
          ? "relative min-h-[70vh] min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,#1e1b4b_0%,#020817_55%)]"
          : "relative min-w-0"
      }
      style={storyReaderColumnStyle}
    >
      {framed ? (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,23,0.15),rgba(2,8,23,0.55))]" />
      ) : null}
      <div className={`relative w-full min-w-0 ${className}`}>{children}</div>
    </div>
  );
}
