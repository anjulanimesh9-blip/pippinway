"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import { isLiveListing } from "@/lib/filterListings";

export interface Seller {
  displayName: string;
  profileImage?: string;
  country?: string;
  phone?: string;
  whatsapp?: string;
  membership?: string;
  membershipSince?: { toDate?: () => Date } | Date | string;
  verifiedSeller?: boolean;
  email?: string;
  createdAt?: { seconds?: number; toDate?: () => Date } | Date | string;
}

export interface Listing {
  id: string;
  title: string;
  price: number | string;
  imageUrls?: string[];
  imageUrl?: string;
  category?: string;
  location?: string;
  featured?: boolean;
  createdAt?: any;
}

export function useSeller() {
  const { uid } = useParams<{ uid: string }>();

  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (!uid) return;

    const loadSeller = async () => {
      try {
        // Seller Profile
        const sellerRef = doc(db, "users", uid);
        const sellerSnap = await getDoc(sellerRef);

        if (!sellerSnap.exists()) {
          setLoading(false);
          return;
        }

        const sellerData = sellerSnap.data() as Seller;
        setSeller(sellerData);

        // Seller Listings
        const listingsRef = collection(db, "listings");

        const q = query(
          listingsRef,
          where("ownerEmail", "==", sellerData.email),
          where("approved", "==", true)
        );

        const snap = await getDocs(q);

        const data: Listing[] = snap.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Listing, "id">),
          }))
          .filter((listing) => isLiveListing(listing));

        setListings(data);
      } catch (error) {
        console.error("Failed to load seller:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSeller();
  }, [uid]);

  return {
    loading,
    seller,
    listings,
  };
}