import Link from "next/link";
import { vibeSectionMetadata } from "@/lib/vibe/seo";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import { VIBE_QUIZZES } from "@/lib/vibe/quizzes";
import VibePageTrack from "../components/VibePageTrack";
import VibeShell from "../components/VibeShell";

export const metadata = vibeSectionMetadata(
  "Quizzes & Trivia",
  "Play Pippinway Vibe quizzes: personality snapshots, love language and Zimbabwe trivia. Built so more quizzes can be added later.",
  VIBE_PATHS.quizzes
);

export default function QuizzesPage() {
  return (
    <VibeShell>
      <VibePageTrack event="vibe_page_view" />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-4">
        <Link href={VIBE_PATHS.home} className="text-sm text-[#FBB03B]">
          ← Back to Vibe
        </Link>
        <section>
          <h1 className="text-2xl font-bold">Quizzes & Trivia 🧠</h1>
          <p className="mt-2 text-sm text-gray-300">
            Short, reusable quizzes. New ones can be added in the quiz list without redesigning Vibe.
          </p>
        </section>
        <div className="grid gap-3 sm:grid-cols-2">
          {VIBE_QUIZZES.map((quiz) => (
            <Link
              key={quiz.slug}
              href={VIBE_PATHS.quiz(quiz.slug)}
              className="rounded-2xl border border-white/10 bg-[#0F172A] p-4 hover:border-[#FBB03B]/40"
            >
              <div className="text-2xl">{quiz.emoji}</div>
              <h2 className="mt-2 font-semibold">{quiz.title}</h2>
              <p className="mt-1 text-sm text-gray-400">{quiz.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </VibeShell>
  );
}
