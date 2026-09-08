"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { trackVibe } from "@/lib/analytics";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import {
  quizBySlug,
  scorePersonality,
  scoreTrivia,
} from "@/lib/vibe/quizzes";
import EntertainmentNote from "../../components/EntertainmentNote";
import VibeShell from "../../components/VibeShell";

export default function QuizPlayClient({ slug }: { slug: string }) {
  const quiz = quizBySlug(slug);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  if (!quiz) {
    notFound();
    return null;
  }

  const question = quiz.questions[step];
  const personality =
    done && quiz.kind === "personality" ? scorePersonality(quiz, answers) : null;
  const trivia = done && quiz.kind === "trivia" ? scoreTrivia(quiz, answers) : null;

  const choose = (optionId: string) => {
    const next = { ...answers, [question.id]: optionId };
    setAnswers(next);
    if (step === 0 && Object.keys(answers).length === 0) {
      trackVibe("vibe_quiz_start", { quiz_id: quiz.slug });
    }
    if (step + 1 >= quiz.questions.length) {
      setDone(true);
      trackVibe("vibe_quiz_complete", { quiz_id: quiz.slug });
      return;
    }
    setStep(step + 1);
  };

  return (
    <VibeShell>
      <div className="mx-auto max-w-xl space-y-4 px-4 py-4">
        <Link href={VIBE_PATHS.quizzes} className="text-sm text-[#FBB03B]">
          ← All quizzes
        </Link>
        <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-5">
          <p className="text-2xl">{quiz.emoji}</p>
          <h1 className="mt-1 text-2xl font-bold">{quiz.title}</h1>
          {!done && question ? (
            <>
              <p className="mt-4 text-sm text-gray-400">
                {step + 1} / {quiz.questions.length}
              </p>
              <p className="mt-2 text-lg font-medium">{question.prompt}</p>
              <div className="mt-4 space-y-2">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(option.id)}
                    className="block w-full rounded-xl border border-white/10 bg-[#020817] px-4 py-3 text-left hover:border-[#FBB03B]/50"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-4">
              {personality ? (
                <>
                  <p className="text-sm text-gray-400">Your result</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#FBB03B]">{personality.title}</h2>
                  <p className="mt-2 text-gray-200">{personality.blurb}</p>
                </>
              ) : null}
              {trivia ? (
                <>
                  <p className="text-sm text-gray-400">Score</p>
                  <h2 className="mt-1 text-3xl font-bold text-[#FBB03B]">
                    {trivia.correct} / {trivia.total}
                  </h2>
                  <p className="mt-2 text-gray-200">
                    {trivia.correct === trivia.total
                      ? "Clean sweep. You know your Zimbabwe."
                      : "A friendly round — try again whenever you like."}
                  </p>
                </>
              ) : null}
              <button
                type="button"
                className="mt-5 rounded-full border border-white/10 px-4 py-2 text-sm"
                onClick={() => {
                  setAnswers({});
                  setStep(0);
                  setDone(false);
                }}
              >
                Play again
              </button>
            </div>
          )}
          <div className="mt-5">
            <EntertainmentNote>
              Quizzes are for entertainment. They are not career, medical or relationship advice.
            </EntertainmentNote>
          </div>
        </section>
      </div>
    </VibeShell>
  );
}
