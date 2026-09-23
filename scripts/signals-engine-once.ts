import { runMonitoringCycle } from "../lib/signals-engine/monitor-cycle";
import { loadPublishedScanSnapshot } from "../lib/signals/scan-snapshot";

async function main() {
  const cycle = await runMonitoringCycle();
  const published = await loadPublishedScanSnapshot();
  console.log(JSON.stringify({
    ok: cycle.ok,
    overlapped: cycle.overlapped,
    eligible: cycle.eligible,
    selected: cycle.selected,
    analyzed: cycle.analyzed?.length ?? 0,
    long: cycle.long,
    short: cycle.short,
    wait: cycle.wait,
    weight: cycle.weightUsed,
    ms: cycle.durationMs,
    note: cycle.coverageNote || cycle.error || null,
    snapshotCoins: published?.response?.coins?.length ?? 0,
    snapshotPublishedAt: published?.publishedAt ?? null,
  }));
}

main().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    error: error instanceof Error ? error.message : String(error),
  }));
  process.exit(1);
});
