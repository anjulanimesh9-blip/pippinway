"use client";

import { useEffect, useState } from "react";

export default function UtcCountdown({ resetAt }: { resetAt?: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (!resetAt) return <span>—</span>;
  const remaining = Date.parse(resetAt) - now;
  if (!Number.isFinite(remaining) || remaining <= 0) return <span>refreshing…</span>;
  const total = Math.floor(remaining / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return (
    <span className="tabular-nums">
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      <span className="ml-1 text-[11px] font-normal text-slate-400">UTC</span>
    </span>
  );
}
