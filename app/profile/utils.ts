import { isLiveListing } from "@/lib/filterListings";

export type ListingStatus = "active" | "pending" | "sold" | "draft";

export function getListingStatus(ad: any): ListingStatus {
  if (ad?.sold === true || ad?.status === "sold") return "sold";
  if (ad?.draft === true || ad?.status === "draft") return "draft";
  if (ad?.approved === true && ad?.rejected !== true && isLiveListing(ad)) {
    return "active";
  }
  return "pending";
}

export function formatMemberSince(raw: unknown, fallback?: string): string {
  if (raw && typeof (raw as { toDate?: () => Date }).toDate === "function") {
    return (raw as { toDate: () => Date }).toDate().toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }

  if (raw && typeof (raw as { seconds?: number }).seconds === "number") {
    return new Date((raw as { seconds: number }).seconds * 1000).toLocaleDateString(
      "en-US",
      { month: "short", year: "numeric" }
    );
  }

  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return raw.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  if (typeof raw === "string") {
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
  }

  if (fallback) {
    const parsed = new Date(fallback);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
  }

  return "2024";
}

export function makeHandle(name: string, email?: string | null): string {
  const fromName = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  if (fromName) return `@${fromName}`;
  const fromEmail = email?.split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "") || "user";
  return `@${fromEmail}`;
}

export function computeSellerScore(input: {
  displayName?: string;
  profileImage?: string;
  country?: string;
  phone?: string;
  membership?: string;
  verifiedSeller?: boolean;
  totalAds: number;
  activeAds: number;
  repliedChats: number;
  totalChats: number;
}) {
  const profileBits = [
    input.displayName,
    input.profileImage,
    input.country,
    input.phone,
  ].filter(Boolean).length;
  const profileStrength = Math.round((profileBits / 4) * 100);

  const listingHealth = input.totalAds
    ? Math.round((input.activeAds / input.totalAds) * 100)
    : 40;

  const responseRate = input.totalChats
    ? Math.round((input.repliedChats / input.totalChats) * 100)
    : 90;

  const trust =
    input.verifiedSeller || input.membership === "pro" ? 96 : 72;

  const overall = Math.min(
    99,
    Math.round((profileStrength + listingHealth + responseRate + trust) / 4)
  );

  const label =
    overall >= 85
      ? "Excellent"
      : overall >= 70
        ? "Good"
        : overall >= 50
          ? "Fair"
          : "New Seller";

  return {
    overall,
    label,
    profileStrength,
    listingHealth,
    responseRate,
    trust,
  };
}
