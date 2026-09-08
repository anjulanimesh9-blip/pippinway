import type { Metadata } from "next";
import { getPublicVibePost } from "@/lib/getPublicVibePost";
import { vibePostMetadata } from "@/lib/vibe/seo";
import VibePostClient from "./VibePostClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublicVibePost(id);
  return vibePostMetadata(post, id);
}

export default async function VibePostPage({ params }: PageProps) {
  const { id } = await params;
  return <VibePostClient id={id} />;
}
