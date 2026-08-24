import type { FeaturedPackage } from "@/lib/types/featured";

export function toMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof (value as { toMillis?: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof (value as { seconds?: number }).seconds === "number") {
    return (value as { seconds: number }).seconds * 1000;
  }
  const d = new Date(value as string | number);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

export function getPackageDurationDays(pkg: FeaturedPackage): number {
  const days = Number(pkg.durationDays ?? pkg.validityDays ?? 0);
  return days > 0 ? days : 7;
}

export interface FeaturedPackageSnapshot {
  packageId: string;
  packageName: string;
  packageCredits: number;
  packageDurationDays: number;
  packagePrice: number;
  packageCurrency: string;
  country?: string;
}

export function buildPackageSnapshot(pkg: FeaturedPackage): FeaturedPackageSnapshot {
  return {
    packageId: pkg.id,
    packageName: pkg.name ?? pkg.country ?? pkg.id,
    packageCredits: Number(pkg.credits ?? 1),
    packageDurationDays: getPackageDurationDays(pkg),
    packagePrice: Number(pkg.price ?? 0),
    packageCurrency: pkg.currency ?? "",
    country: pkg.country,
  };
}
