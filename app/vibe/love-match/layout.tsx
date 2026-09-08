import { vibeSectionMetadata } from "@/lib/vibe/seo";
import { VIBE_PATHS } from "@/lib/vibe/constants";

export const metadata = vibeSectionMetadata(
  "Love Match",
  "Pick two zodiac signs for a playful Pippinway Vibe Love Match. Entertainment only.",
  VIBE_PATHS.loveMatch
);

export default function LoveMatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
