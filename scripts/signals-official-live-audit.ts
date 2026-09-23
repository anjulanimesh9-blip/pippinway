/**
 * Audit official signals for Official Live eligibility.
 * Does not delete history/outcomes — reports exclusions only.
 *
 * Usage:
 *   npx tsx --env-file=.env.local --use-system-ca scripts/signals-official-live-audit.ts
 */
import { promises as fs } from 'fs';
import path from 'path';
import {
  classifyOfficialLiveRecord,
  selectDisplayableOfficialLive,
} from '../lib/signals/official-live';
import type { OfficialSignal, OfficialStoreSnapshot } from '../lib/signals/official-types';
import { TERMINAL_OFFICIAL } from '../lib/signals/official-types';

async function loadLocal(): Promise<OfficialSignal[]> {
  const file = path.join(process.cwd(), 'data', 'signals-official.json');
  const raw = await fs.readFile(file, 'utf8');
  const parsed = JSON.parse(raw) as OfficialStoreSnapshot;
  return parsed.signals || [];
}

async function main() {
  const now = Date.now();
  const all = await loadLocal();
  const activeIsh = all.filter((item) => !TERMINAL_OFFICIAL.includes(item.lifecycleStatus));
  const { selected, excluded } = selectDisplayableOfficialLive(activeIsh, [], now);

  console.log(JSON.stringify({
    event: 'official_live_audit',
    at: new Date(now).toISOString(),
    totalRecords: all.length,
    nonTerminal: activeIsh.length,
    displayableOfficialLive: selected.length,
    excluded: excluded.length,
    selected: selected.map((item) => ({
      id: item.id,
      symbol: item.symbol,
      direction: item.direction,
      status: item.lifecycleStatus,
      entry: item.originalEntry,
      stop: item.stop,
      target: item.target,
      openedAt: item.openedAt,
      expiresAt: item.expiresAt,
    })),
    excludedDetails: excluded.map((item) => {
      const record = activeIsh.find((row) => row.id === item.id);
      const verdict = record ? classifyOfficialLiveRecord(record, now) : null;
      return {
        ...item,
        entry: record?.originalEntry,
        stop: record?.stop,
        target: record?.target,
        status: record?.lifecycleStatus,
        openedAt: record?.openedAt,
        expiresAt: record?.expiresAt,
        verdict,
      };
    }),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
