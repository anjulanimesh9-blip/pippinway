import { Timestamp } from "firebase/firestore";
import type { FeaturedCreditLot, ListingRecord } from "@/lib/types/featured";
import { getFeaturedStatus } from "@/lib/listingFeatured";

export const DEFAULT_FEATURED_VALIDITY_DAYS = 7;

export function findSpendableLotIndex(lots: FeaturedCreditLot[]): number {
  return lots.findIndex((lot) => Number(lot.remaining ?? 0) > 0);
}

export function buildCreditLot(params: {
  purchaseId: string;
  packageId?: string | null;
  durationDays: number;
  credits: number;
}): FeaturedCreditLot {
  return {
    purchaseId: params.purchaseId,
    packageId: params.packageId ?? null,
    durationDays: params.durationDays,
    remaining: params.credits,
    total: params.credits,
    createdAt: Timestamp.now(),
  };
}

export function consumeLotAtIndex(
  lots: FeaturedCreditLot[],
  index: number
): FeaturedCreditLot[] {
  const next = lots.map((lot) => ({ ...lot }));
  const lot = next[index];
  next[index] = {
    ...lot,
    remaining: Number(lot.remaining ?? 0) - 1,
  };
  return next;
}

export function resolveActivationDuration(
  lots: FeaturedCreditLot[],
  lotIndex: number,
  fallbackDurationDays?: number
): number {
  if (lotIndex >= 0) {
    return Number(lots[lotIndex].durationDays) || DEFAULT_FEATURED_VALIDITY_DAYS;
  }
  return Number(fallbackDurationDays) || DEFAULT_FEATURED_VALIDITY_DAYS;
}

export function isEligibleForFeaturedCredit(listing: ListingRecord): boolean {
  if (!listing.ownerId) return false;
  if (listing.approved !== true) return false;
  if (listing.expired === true) return false;
  if (listing.rejected === true) return false;
  const status = getFeaturedStatus(listing);
  return status === "normal" || status === "expired";
}
