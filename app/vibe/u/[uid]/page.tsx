import type { Metadata } from "next";
import { getPublicVibeProfile } from "@/lib/getPublicVibePost";
import { vibeProfileMetadata } from "@/lib/vibe/seo";
import VibeProfileClient from "./VibeProfileClient";

type PageProps = {
  params: Promise<{ uid: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uid } = await params;
  const profile = await getPublicVibeProfile(uid);
  return vibeProfileMetadata(profile?.displayName, uid, profile?.bio);
}

export default async function VibeProfilePage({ params }: PageProps) {
  const { uid } = await params;
  return <VibeProfileClient uid={uid} />;
}
