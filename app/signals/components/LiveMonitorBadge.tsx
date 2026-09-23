"use client";

import { monitorIsLive, monitorStatusLabel, type MonitorHealth } from "../lib/health";

export default function LiveMonitorBadge({ health }: { health?: MonitorHealth | null }) {
  const live = monitorIsLive(health);
  const label = monitorStatusLabel(health);
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
      live ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-amber-400/30 bg-amber-400/10 text-amber-100"
    }`}>
      <span className={`h-2 w-2 rounded-full ${live ? "bg-emerald-400" : "bg-amber-300"}`} />
      {live ? "Live · monitoring every minute" : `Scanner ${label}`}
    </span>
  );
}
