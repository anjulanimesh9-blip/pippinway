"use client";

import { useCallback, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "@/app/firebase";
import type { FeaturedCreditLot } from "@/lib/types/featured";
import { sendNotification } from "@/lib/sendNotification";
import {
  consumeLotAtIndex,
  findSpendableLotIndex,
  resolveActivationDuration,
} from "@/lib/featuredCredits";

function isCurrentlyFeatured(listing: Record<string, unknown>): boolean {
  if (listing.featured !== true) return false;
  const raw = listing.featuredExpiryDate ?? listing.featuredExpiresAt;
  if (!raw) return true;
  const expiry =
    typeof (raw as { toDate?: () => Date }).toDate === "function"
      ? (raw as { toDate: () => Date }).toDate()
      : new Date(raw as string | number);
  return !isNaN(expiry.getTime()) && expiry.getTime() > Date.now();
}

export default function useActivateCredit(user: User | null) {
  const [activatingListingId, setActivatingListingId] = useState<string | null>(
    null
  );

  const activate = useCallback(
    async (listingId: string): Promise<{ ok: boolean; error?: string }> => {
      if (!user) return { ok: false, error: "You must be logged in." };

      setActivatingListingId(listingId);

      try {
        const meta = await runTransaction(db, async (transaction) => {
          const userRef = doc(db, "users", user.uid);
          const listingRef = doc(db, "listings", listingId);

          const userSnap = await transaction.get(userRef);
          const listingSnap = await transaction.get(listingRef);

          if (!listingSnap.exists()) throw new Error("LISTING_NOT_FOUND");

          const listing = listingSnap.data();

          if (listing.ownerId !== user.uid) throw new Error("NOT_OWNER");
          if (listing.approved !== true) throw new Error("NOT_APPROVED");
          if (listing.expired === true) throw new Error("LISTING_EXPIRED");
          if (listing.rejected === true) throw new Error("LISTING_REJECTED");
          if (isCurrentlyFeatured(listing)) throw new Error("ALREADY_FEATURED");

          const currentCredits = Number(
            userSnap.exists() ? userSnap.data().featuredCredits ?? 0 : 0
          );
          if (currentCredits < 1) throw new Error("NO_CREDITS");

          const lots: FeaturedCreditLot[] = userSnap.exists()
            ? ((userSnap.data().featuredCreditLots as FeaturedCreditLot[]) ?? [])
            : [];

          const lotIndex = findSpendableLotIndex(lots);
          const durationDays = resolveActivationDuration(
            lots,
            lotIndex,
            userSnap.exists()
              ? Number(userSnap.data().featuredCreditDurationDays)
              : undefined
          );

          const now = Timestamp.now();
          const expiry = Timestamp.fromMillis(
            now.toMillis() + durationDays * 24 * 60 * 60 * 1000
          );

          const spentLot = lotIndex >= 0 ? lots[lotIndex] : null;
          const userUpdate: {
            featuredCredits: number;
            featuredCreditLots?: FeaturedCreditLot[];
          } = { featuredCredits: currentCredits - 1 };

          if (lotIndex >= 0) {
            userUpdate.featuredCreditLots = consumeLotAtIndex(lots, lotIndex);
          }

          transaction.update(userRef, userUpdate);

          const listingUpdate: Record<string, unknown> = {
            featured: true,
            adType: "featured",
            featuredStartDate: now,
            featuredExpiryDate: expiry,
            featuredExpiresAt: expiry,
            featuredBy: user.uid,
          };
          if (spentLot?.packageId) listingUpdate.featuredPackageId = spentLot.packageId;
          if (spentLot?.purchaseId) listingUpdate.featuredPurchaseId = spentLot.purchaseId;

          transaction.update(listingRef, listingUpdate);

          return {
            durationDays,
            purchaseId: spentLot?.purchaseId ?? null,
            listingTitle: String(listing.title ?? "Your ad"),
          };
        });

        await addDoc(collection(db, "featured_logs"), {
          listingId,
          userId: user.uid,
          action: "credit_used",
          durationDays: meta.durationDays,
          purchaseId: meta.purchaseId,
          timestamp: serverTimestamp(),
        });

        if (user.email) {
          await sendNotification({
            userEmail: user.email,
            title: "Ad featured",
            message: `"${meta.listingTitle}" is now Featured for ${meta.durationDays} days. 1 credit used.`,
            type: "featured",
            listingId,
          });
        }

        return { ok: true };
      } catch (err: unknown) {
        const code = err instanceof Error ? err.message : String(err);
        const firebaseCode =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: string }).code)
            : "";

        if (firebaseCode === "permission-denied") {
          return {
            ok: false,
            error:
              "Permission denied. Deploy the latest Firestore rules, then try again.",
          };
        }
        if (code === "NO_CREDITS") {
          return { ok: false, error: "You don't have any Featured Credits left." };
        }
        if (code === "NOT_OWNER") {
          return { ok: false, error: "You can only feature your own ads." };
        }
        if (code === "NOT_APPROVED") {
          return { ok: false, error: "Only approved live ads can be featured." };
        }
        if (code === "LISTING_EXPIRED") {
          return { ok: false, error: "This ad has expired." };
        }
        if (code === "LISTING_REJECTED") {
          return { ok: false, error: "This ad was rejected." };
        }
        if (code === "ALREADY_FEATURED") {
          return { ok: false, error: "This ad is already featured." };
        }
        if (code === "LISTING_NOT_FOUND") {
          return { ok: false, error: "This ad no longer exists." };
        }

        console.error("Failed to activate credit:", err);
        return { ok: false, error: "Something went wrong. Please try again." };
      } finally {
        setActivatingListingId(null);
      }
    },
    [user]
  );

  return {
    activate,
    activating: activatingListingId != null,
    activatingListingId,
  };
}
