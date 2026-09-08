import { vibeHomeMetadata } from "@/lib/vibe/seo";
import VibeHomeClient from "./VibeHomeClient";

export const metadata = vibeHomeMetadata();

export default function VibePage() {
  return <VibeHomeClient />;
}
