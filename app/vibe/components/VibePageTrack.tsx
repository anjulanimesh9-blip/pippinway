"use client";

import { useEffect } from "react";
import { trackVibe } from "@/lib/analytics";

export default function VibePageTrack({
  event,
  sign,
  quizId,
}: {
  event: string;
  sign?: string;
  quizId?: string;
}) {
  useEffect(() => {
    trackVibe(event, { sign, quiz_id: quizId });
  }, [event, quizId, sign]);
  return null;
}
