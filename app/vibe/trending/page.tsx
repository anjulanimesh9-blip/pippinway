import Link from "next/link";
import { vibeSectionMetadata } from "@/lib/vibe/seo";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import VibeComposer from "../components/VibeComposer";
import VibeFeed from "../components/VibeFeed";
import VibePageTrack from "../components/VibePageTrack";
import VibeShell from "../components/VibeShell";

export const metadata = vibeSectionMetadata(
  "Trending in Zim",
  "Community conversation from Zimbabwe on Pippinway Vibe. Entertainment and lifestyle talk — not a news wire and not marketplace ads.",
  VIBE_PATHS.trending
);

export default function TrendingZimPage() {
  return (
    <VibeShell>
      <VibePageTrack event="vibe_page_view" />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-4">
        <Link href={VIBE_PATHS.home} className="text-sm text-[#FBB03B]">
          ← Back to Vibe
        </Link>
        <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-5">
          <h1 className="text-2xl font-bold">Trending in Zim 🔥</h1>
          <p className="mt-2 text-sm text-gray-300">
            A home for Zimbabwe-related lifestyle, humour and community posts. This is not a newsroom and does not publish unverified headlines as fact.
          </p>
        </section>
        <VibeComposer defaultCategory="trending-zim" />
        <VibeFeed category="trending-zim" />
      </div>
    </VibeShell>
  );
}
