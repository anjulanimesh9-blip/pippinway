import { vibeSectionMetadata } from "@/lib/vibe/seo";
import { VIBE_PATHS } from "@/lib/vibe/constants";

export const metadata = vibeSectionMetadata(
  "Lucky Today",
  "A daily lucky number, colour and short message on Pippinway Vibe. Entertainment only.",
  VIBE_PATHS.lucky
);

export default function LuckyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
