import Link from "next/link";
import { vibeSectionMetadata } from "@/lib/vibe/seo";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import VibeHero from "../components/VibeHero";
import VibePageTrack from "../components/VibePageTrack";
import VibeShell from "../components/VibeShell";
import StarsClient from "./StarsClient";

export const metadata = vibeSectionMetadata(
  "Your Stars",
  "Pippinway Vibe Your Stars: zodiac signs, community star notes and playful readings. Entertainment only.",
  VIBE_PATHS.stars
);

export default function YourStarsPage() {
  return (
    <VibeShell>
      <VibePageTrack event="vibe_stars_open" />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-4">
        <Link href={VIBE_PATHS.home} className="text-sm text-[#FBB03B]">
          ← Back to Vibe
        </Link>
        <VibeHero compact />
        <StarsClient />
      </div>
    </VibeShell>
  );
}
