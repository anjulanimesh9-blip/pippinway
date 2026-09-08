import type { Metadata } from "next";
import SavedVibeClient from "./SavedVibeClient";

export const metadata: Metadata = {
  title: "Saved Vibe posts",
  robots: { index: false, follow: false },
};

export default function SavedVibeRoute() {
  return <SavedVibeClient />;
}
