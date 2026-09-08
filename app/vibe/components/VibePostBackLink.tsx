"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VIBE_PATHS } from "@/lib/vibe/constants";
import {
  classifyInternalPath,
  defaultVibeOrigin,
  persistVibePostOrigin,
  readLastInternalPath,
  resolveVibePostOrigin,
  safeReferrerPath,
  type VibePostOrigin,
} from "@/lib/vibe/postOrigin";

function subscribeOrigin() {
  return () => {};
}

function serializeOrigin(origin: VibePostOrigin): string {
  return `${origin.kind}|${origin.href}`;
}

function parseOrigin(value: string): VibePostOrigin {
  const sep = value.indexOf("|");
  const kind = value.slice(0, sep);
  const href = value.slice(sep + 1);
  if (kind === "marketplace") return { kind: "marketplace", href };
  return { kind: "vibe", href: href || VIBE_PATHS.home };
}

export default function VibePostBackLink({
  fromParam,
}: {
  fromParam?: string | null;
}) {
  const router = useRouter();
  const snapshot = useSyncExternalStore(
    subscribeOrigin,
    () => serializeOrigin(resolveVibePostOrigin(fromParam)),
    () => serializeOrigin(defaultVibeOrigin())
  );
  const origin = useMemo(() => parseOrigin(snapshot), [snapshot]);

  useEffect(() => {
    persistVibePostOrigin(origin);
  }, [origin]);

  const label =
    origin.kind === "marketplace" ? "← Back to Marketplace" : "← Back to Vibe";
  const href = origin.href || VIBE_PATHS.home;

  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center text-[13px] text-[#FBB03B] sm:min-h-0 sm:text-sm"
      onClick={(event) => {
        if (window.history.length < 2) return;
        const previous = safeReferrerPath() ?? readLastInternalPath();
        if (!previous) return;
        const previousKind = classifyInternalPath(previous);
        const canUseHistory =
          (origin.kind === "vibe" && previousKind === "vibe") ||
          (origin.kind === "marketplace" && previousKind === "marketplace");
        if (canUseHistory) {
          event.preventDefault();
          router.back();
        }
      }}
    >
      {label}
    </Link>
  );
}
