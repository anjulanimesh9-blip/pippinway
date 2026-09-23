# Pippinway Signals persistent worker (Linux container)
FROM node:22-bookworm-slim

WORKDIR /app

# System CA store (required for Binance TLS on some hosts)
ENV NODE_OPTIONS=--use-system-ca

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Runtime data (scan job / lease / local snapshot fallback)
RUN mkdir -p /app/data

# Do NOT bake Firebase credentials into the image.
# Mount or inject GOOGLE_APPLICATION_CREDENTIALS / FIREBASE_SERVICE_ACCOUNT_JSON at runtime.

ENV SIGNALS_WORKER_MODE=engine
ENV SIGNALS_PRICE_INTERVAL_MS=60000
ENV SIGNALS_ANALYSIS_INTERVAL_MS=180000

HEALTHCHECK --interval=60s --timeout=10s --start-period=90s --retries=3 \
  CMD node -e "const fs=require('fs');const p='data/scan-snapshot.json';if(!fs.existsSync(p))process.exit(1);const j=JSON.parse(fs.readFileSync(p,'utf8'));const age=Date.now()-Date.parse(j.publishedAt||0);process.exit(age<10*60*1000?0:1)"

CMD ["node", "--use-system-ca", "scripts/signals-monitor-worker.mjs"]
