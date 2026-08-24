import type { Timestamp } from "firebase/firestore";

export interface FeaturedCreditLot {
  purchaseId: string;
  packageId?: string | null;
  durationDays: number;
  remaining: number;
  total: number;
  createdAt: Timestamp | { seconds: number; nanoseconds?: number } | Date;
}

export interface FeaturedPackage {
  id: string;
  active?: boolean;
  name?: string;
  country?: string;
  credits: number;
  price: number;
  currency: string;
  durationDays?: number;
  validityDays?: number;
  displayOrder?: number;
  description?: string;
  createdAt?: unknown;
}

export interface FeaturedPackagePurchase {
  id: string;
  userId: string;
  listingId: string;
  listingTitle?: string;
  country: string;
  currency: string;
  amount: number;
  credits: number;
  paymentMethod?: string;
  receiptUrl: string;
  status: "pending" | "approved" | "rejected";
  packageId?: string;
  packageName?: string;
  packageDurationDays?: number;
  createdAt?: unknown;
  approvedAt?: unknown;
  approvedBy?: string;
  rejectedAt?: unknown;
  rejectedBy?: string;
}

export type BannerPlacement = "infeed" | "sidebar" | "profile";

/** Auto Fit contains the full image; Crop to Fill covers the slot. */
export type BannerFitMode = "auto" | "cover";

export interface Banner {
  id: string;
  active?: boolean;
  imageUrl: string;
  country?: string;
  priority?: number;
  startDate?: unknown;
  endDate?: unknown;
  linkType?: "none" | "listing" | "category" | "external";
  listingId?: string;
  externalUrl?: string;
  /** Missing on older banners; treat as in-feed (never profile). */
  placement?: BannerPlacement;
  /** Missing on older banners; treat as Auto Fit. */
  fitMode?: BannerFitMode;
}

export interface ListingRecord {
  id: string;
  title?: string;
  price?: number | string;
  amount?: unknown;
  currency?: string;
  country?: string;
  location?: string;
  category?: string;
  imageUrl?: string;
  imageUrls?: string[];
  ownerId?: string;
  ownerEmail?: string;
  approved?: boolean;
  rejected?: boolean;
  expired?: boolean;
  expiresAt?: unknown;
  publishedAt?: unknown;
  featured?: boolean;
  adType?: string;
  featuredStartDate?: unknown;
  featuredUntil?: unknown;
  featuredExpiryDate?: unknown;
  featuredExpiresAt?: unknown;
  featuredPackageId?: string | null;
  featuredPurchaseId?: string | null;
  featuredBy?: string;
  createdAt?: unknown;
  slug?: string;
}
