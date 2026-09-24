# Pippinway Signals — permanent 24/7 worker host

This host runs Binance Futures + the Signals engine and publishes Firestore snapshots.
Vercel only **reads** those snapshots. Do **not** run continuous Binance scanning on Vercel (HTTP 451).

## Never commit

- `.env.local`
- `FIREBASE_SERVICE_ACCOUNT_JSON` / service-account private keys
- `*firebase-adminsdk*.json`
- `GOOGLE_APPLICATION_CREDENTIALS` file contents
- `data/*.json` (runtime scan/lease/snapshot)
- `SIGNALS_MONITOR_SECRET` values

## Connectivity pretest (required)

On the candidate VPS (same region/network as the worker):

```bash
curl -sS -o /tmp/ex.json -w "exchangeInfo HTTP %{http_code} time %{time_total}s\n" \
  https://fapi.binance.com/fapi/v1/exchangeInfo
curl -sS -o /tmp/t24.json -w "ticker24hr HTTP %{http_code} time %{time_total}s\n" \
  https://fapi.binance.com/fapi/v1/ticker/24hr
node -e "const e=require('/tmp/ex.json'); const n=(e.symbols||[]).filter(s=>s.status==='TRADING'&&s.contractType==='PERPETUAL'&&s.quoteAsset==='USDT').length; console.log('tradingUsdtPerp', n)"
```

**Abort hosting in that region if either call is not HTTP 200.**

## Resource recommendations (Hobby / small VPS)

| Item | Recommendation |
|---|---|
| Node | **22 LTS** (20+ OK) |
| RAM | **1–2 GB** (2 GB preferred) |
| CPU | **1–2 vCPU** |
| Disk | **10+ GB** (app + logs + `data/`) |
| OS | Ubuntu 22.04/24.04 or Debian bookworm |

Estimated steady usage: low CPU between cycles; spikes during Top 100 pattern analysis. Binance weight typically well under 2400/min with caching.

## Environment variables

```bash
GOOGLE_APPLICATION_CREDENTIALS=/etc/pippinway/firebase-adminsdk.json
# or FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'  (prefer file mount)
FIREBASE_PROJECT_ID=pippinway-e9719
SIGNALS_WORKER_MODE=engine
SIGNALS_PRICE_INTERVAL_MS=60000
SIGNALS_ANALYSIS_INTERVAL_MS=300000
NODE_OPTIONS=--use-system-ca
```

Optional: `FIRESTORE_EMULATOR_HOST` for local tests only.

## Start command

```bash
cd /opt/pippinway
npm ci
node --use-system-ca scripts/signals-monitor-worker.mjs
```

Or: `npm run monitor:worker`

## systemd

```bash
sudo useradd -r -s /usr/sbin/nologin pippinway || true
sudo mkdir -p /opt/pippinway /etc/pippinway /opt/pippinway/data
sudo cp -a ./ /opt/pippinway/
# Place Admin JSON (never in git):
sudo install -m 600 /secure/path/firebase-adminsdk.json /etc/pippinway/firebase-adminsdk.json
sudo chown -R pippinway:pippinway /opt/pippinway /etc/pippinway
sudo cp deploy/signals-worker/pippinway-signals-worker.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pippinway-signals-worker
sudo systemctl status pippinway-signals-worker
sudo journalctl -u pippinway-signals-worker -f
```

## Docker Compose

```bash
cd deploy/signals-worker
cp .env.worker.example .env.worker   # fill secrets locally
export FIREBASE_ADMIN_HOST_PATH=/secure/path/firebase-adminsdk.json
docker compose up -d --build
docker compose logs -f
```

## Health check

- Process alive (`systemctl is-active` / Docker health)
- `data/scan-snapshot.json` `publishedAt` age &lt; 10 minutes
- Production ticker: `source` contains `persistent-worker`
- Worker logs: `price_cycle` ~60s, `analysis_cycle` with `analyzedCount` / `selected` = 50/50 after a full pass

## Cutover from Windows PC

1. Verify Binance **200** on the VPS.
2. Start the VPS worker with the same Firebase project credentials.
3. Confirm Production ticker `publishedAt` advances while the Windows worker is **stopped**.
4. Only then disable the Windows `npm run monitor:worker` session.

Do not delete the Windows worker until VPS publish is verified.
