import { vibeSectionMetadata } from "@/lib/vibe/seo";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import VibeShell from "../components/VibeShell";
import { StoryReaderPage } from "./StoryReaderLayout";

export const metadata = vibeSectionMetadata(
  "Interactive Stories",
  "Read choose-your-path stories on Pippinway Vibe. Start with The Last Witness, an interactive crime thriller.",
  VIBE_PATHS.interactiveStories
);

export default function InteractiveStoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VibeShell>
      <StoryReaderPage>{children}</StoryReaderPage>
    </VibeShell>
  );
}
