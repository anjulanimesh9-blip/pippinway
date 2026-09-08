import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { quizBySlug } from "@/lib/vibe/quizzes";
import { vibeSectionMetadata } from "@/lib/vibe/seo";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import QuizPlayClient from "./QuizPlayClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const quiz = quizBySlug(slug);
  if (!quiz) return { title: "Quiz" };
  return vibeSectionMetadata(quiz.title, quiz.description, VIBE_PATHS.quiz(slug));
}

export default async function QuizPage({ params }: PageProps) {
  const { slug } = await params;
  if (!quizBySlug(slug)) notFound();
  return <QuizPlayClient slug={slug} />;
}
