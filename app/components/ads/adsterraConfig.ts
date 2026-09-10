/**
 * Adsterra 300×250 placements.
 *
 * Adsterra Support confirmed the same banner key may be reused on a page when
 * each unit runs in an isolated execution context (iframe srcDoc).
 * Do not invent alternate keys unless the dashboard provides new ones.
 */

import { MARKETPLACE_PAGE_SIZE } from "@/lib/fetchCountryListings";
import { VIBE_FEED_PAGE_SIZE } from "@/lib/vibe/constants";

/** Approved live 300×250 banner key — reused via isolated AdsterraBanner instances. */
export const ADSTERRA_AD_KEY = "3911d3739b79fa88dd424ae24ccf3ca8";

/** Insert an Adsterra unit after every N content items. */
export const ADSTERRA_INTERVAL = 2;

export const ADSTERRA_MARKETPLACE_SLOT_COUNT = Math.floor(
  MARKETPLACE_PAGE_SIZE / ADSTERRA_INTERVAL
); // 8

export const ADSTERRA_VIBE_PAGE_SLOT_COUNT = Math.floor(
  VIBE_FEED_PAGE_SIZE / ADSTERRA_INTERVAL
); // 5

export function adsterraInvokeSrc(adKey: string): string {
  return `https://www.highrevenueformat.com/${adKey}/invoke.js`;
}

/** Official snippet HTML for an isolated iframe document. */
export function adsterraSrcDoc(adKey: string): string {
  const src = adsterraInvokeSrc(adKey);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;}</style></head><body><script>atOptions={key:${JSON.stringify(adKey)},format:"iframe",height:250,width:300,params:{}};</script><script src=${JSON.stringify(src)}></script></body></html>`;
}
