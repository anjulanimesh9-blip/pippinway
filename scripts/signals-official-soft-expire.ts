/**
 * Soft-expire official records past expiresAt.
 * Updates lifecycleStatus to EXPIRED only — does not delete signals or outcomes.
 *
 *   npx tsx --env-file=.env.local scripts/signals-official-soft-expire.ts
 *   npx tsx --env-file=.env.local scripts/signals-official-soft-expire.ts --apply
 */
import { promises as fs } from 'fs';
import path from 'path';
import type { OfficialStoreSnapshot } from '../lib/signals/official-types';
import { TERMINAL_OFFICIAL } from '../lib/signals/official-types';

async function main() {
  const apply = process.argv.includes('--apply');
  const file = path.join(process.cwd(), 'data', 'signals-official.json');
  const raw = await fs.readFile(file, 'utf8');
  const store = JSON.parse(raw) as OfficialStoreSnapshot;
  const now = Date.now();
  const candidates = (store.signals || []).filter((item) => {
    if (TERMINAL_OFFICIAL.includes(item.lifecycleStatus)) return false;
    const exp = Date.parse(item.expiresAt);
    return Number.isFinite(exp) && exp <= now;
  });

  console.log(JSON.stringify({
    event: 'official_soft_expire',
    apply,
    at: new Date(now).toISOString(),
    candidates: candidates.length,
    ids: candidates.map((item) => ({
      id: item.id,
      symbol: item.symbol,
      status: item.lifecycleStatus,
      expiresAt: item.expiresAt,
      openedAt: item.openedAt,
    })),
  }, null, 2));

  if (!apply || !candidates.length) return;

  const ids = new Set(candidates.map((item) => item.id));
  store.signals = (store.signals || []).map((item) => {
    if (!ids.has(item.id)) return item;
    return {
      ...item,
      lifecycleStatus: 'EXPIRED' as const,
      closedAt: item.closedAt || item.expiresAt,
      updatedAt: new Date(now).toISOString(),
    };
  });
  await fs.writeFile(file, JSON.stringify(store, null, 2));
  console.log(JSON.stringify({ event: 'official_soft_expire_applied', count: candidates.length }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
