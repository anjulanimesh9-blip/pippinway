"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Share2 } from "lucide-react";
import ImageGallery from "@/app/components/listing/ImageGallery";
import ListingInfo from "@/app/components/listing/ListingInfo";
import ActionButtons from "@/app/components/listing/ActionButtons";
import SellerCard from "@/app/components/listing/SellerCard";
import RelatedAds from "@/app/components/listing/RelatedAds";
import DeleteModal from "@/app/components/listing/DeleteModal";
import MobileBottomNav from "../../components/MobileBottomNav";
import Navbar from "../../components/Navbar";
import Footer from "../../components/homepage/Footer/Footer";
import { useGuestAuthPrompt } from "../../components/GuestAuthPrompt";
import { trackListingView, trackSellerContact } from "@/lib/analytics";
import { getRelativeTime } from "@/lib/formatPrice";
import { isLiveListing } from "@/lib/filterListings";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";
import type { PublicListingFields } from "@/lib/getPublicListing";
import { countryMarketplacePath } from "@/lib/countries";
import { SUPPORT_EMAIL } from "@/lib/site";
import {
  doc,
  getDoc,
  deleteDoc,
  getDocs,
  collection,
  limit,
  query,
  where,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import {
  useParams,
  useRouter,
} from "next/navigation";

export default function ListingClient({
  initialItem = null,
}: {
  initialItem?: PublicListingFields | null;
}) {
  const [item, setItem] =
    useState<any>(initialItem);
  const [saved, setSaved] = useState(false);
  const [sellerAds, setSellerAds] = useState<any[]>([]);
  const [relatedAds, setRelatedAds] =
    useState<any[]>([]);
  
    const [showDeleteModal, setShowDeleteModal] =
  useState(false);

  const currentUser =
    auth.currentUser;

  const router = useRouter();
  const params = useParams();
  const { requireAuth } = useGuestAuthPrompt();
  const lastViewedListingId = useRef<string | null>(null);

  const slug =
    params?.slug as string;


  const currencyMap: any = {
    singapore: "SGD $",
    india: "₹",
    thailand: "฿",
    zimbabwe: "USD $",
    usa: "USD $",
    maldives: "MVR",
    "sri lanka": "Rs.",
    "south africa": "R",
    "united kingdom": "£",
    canada: "CAD $",
  };

  const handleDelete =
    async () => {

      await deleteDoc(
        doc(
          db,
          "listings",
          slug
        )
      );

      alert(
        "Listing deleted!"
      );

      router.push(countryMarketplacePath(item?.country));
    };
   
const startChat = async () => {
  if (!currentUser?.email) {
    requireAuth(`/listings/${slug}`);
    return;
  }

  const sellerEmail =
    item?.ownerEmail ||
    item?.email ||
    item?.userEmail ||
    item?.postedBy;

  if (!sellerEmail) {
    alert("Seller email not found.");
    return;
  }

console.log("Current User:", currentUser?.email);
console.log("Seller:", sellerEmail);
console.log("Owner:", item?.ownerEmail);

  if (sellerEmail === currentUser.email) {
    alert("You can't chat with yourself.");
    return;
  }

  const buyerEmail = currentUser.email;

  const chatId = [buyerEmail, sellerEmail, slug]
    .sort()
    .join("_");

  await setDoc(
    doc(db, "chats", chatId),
    {
      buyerEmail,
      sellerEmail,
      listingId: slug,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

 trackSellerContact({
   listing_id: slug,
   contact_method: "chat",
   category: item?.category,
   country: item?.country,
 });
 router.push(`/chat?chatId=${chatId}`);
};

    

  useEffect(() => {
    if (!slug) return;

       const fetchListing =
      async () => {
        try {
          const docRef = doc(
            db,
            "listings",
            slug
          );

          const docSnap =
            await getDoc(docRef);

          if (
            docSnap.exists()
          ) {
            const listingData: any = {
              id: docSnap.id,
              ...docSnap.data(),
            };

            if (
  listingData.approved !== true ||
  !isLiveListing(listingData)
) {
  router.push(countryMarketplacePath(listingData.country));
  return;
}
            setItem(
              listingData
            );

            const listingsRef = collection(db, "listings");
            const relatedQuery = listingData.category
              ? query(
                  listingsRef,
                  where("category", "==", listingData.category),
                  limit(16)
                )
              : query(listingsRef, limit(16));
            const sellerQuery = listingData.ownerId
              ? query(
                  listingsRef,
                  where("ownerId", "==", listingData.ownerId),
                  limit(12)
                )
              : listingData.ownerEmail
                ? query(
                    listingsRef,
                    where("ownerEmail", "==", listingData.ownerEmail),
                    limit(12)
                  )
                : null;

            const [relatedSnap, sellerSnap] = await Promise.all([
              getDocs(relatedQuery),
              sellerQuery ? getDocs(sellerQuery) : Promise.resolve(null),
            ]);

            const toLiveAds = (
              docs: Array<{ id: string; data: () => Record<string, unknown> }>
            ) =>
              docs
                .map((docSnap) => ({
                  id: docSnap.id,
                  ...docSnap.data(),
                }))
                .filter(
                  (ad: any) =>
                    ad.id !== slug &&
                    ad.approved === true &&
                    isLiveListing(ad) &&
                    (!listingData.country ||
                      !ad.country ||
                      String(ad.country).trim().toLowerCase() ===
                        String(listingData.country).trim().toLowerCase())
                );

            setSellerAds(sellerSnap ? toLiveAds(sellerSnap.docs) : []);
            setRelatedAds(toLiveAds(relatedSnap.docs));
          }
        } catch (error) {
          console.error(error);
        }
      };

    fetchListing();
  }, [slug]);

  useEffect(() => {
    if (!item?.id) return;
    if (lastViewedListingId.current === item.id) return;
    lastViewedListingId.current = item.id;
    trackListingView({
      listing_id: item.id,
      category: item.category,
      country: item.country,
      location: item.location,
      featured: isActiveFeaturedListing(item),
    });
  }, [item]);

  if (!item) {
    return (
      <h1 className="p-10 text-xl text-white bg-black min-h-screen">
        Loading...
      </h1>
    );
  }
const whatsappLink =
  item?.phone
    ? `https://wa.me/${String(item.phone).replace(/\D/g, "")}`
    : "#";

  const currency =
    currencyMap[
      item?.country
        ?.trim()
        ?.toLowerCase()
    ] || "Rs.";

  const place = [item.location, item.country].filter(Boolean).join(", ");
  const posted = getRelativeTime(item.createdAt) || "Recently";
  const isOwner = currentUser?.email === item.ownerEmail;
  const moreFromSeller = sellerAds.length > 0 ? sellerAds : relatedAds;

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: item.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  return (
    <main className="min-h-screen bg-[#020817] pb-20 text-white lg:pb-8">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-4">
        <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs text-gray-500">
          <Link href="/" className="hover:text-sky-400">
            Home
          </Link>
          <span>›</span>
          <Link
            href={countryMarketplacePath(item.country)}
            className="hover:text-sky-400"
          >
            All ads
          </Link>
          {item.category && (
            <>
              <span>›</span>
              <span className="text-gray-400">{item.category}</span>
            </>
          )}
          <span>›</span>
          <span className="max-w-[200px] truncate text-gray-300 sm:max-w-none">
            {item.title}
          </span>
        </nav>

        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              {item.title}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Posted {posted}
              {place ? ` in ${place}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <Heart
                size={16}
                className={saved ? "fill-red-500 text-red-500" : ""}
              />
              <span className="hidden sm:inline">Save ad</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <ImageGallery
              imageUrls={item.imageUrls}
              imageUrl={item.imageUrl}
              title={item.title}
            />

            <ListingInfo
              price={item.price ?? item.amount}
              currency={currency}
              category={item.category}
              location={item.location}
              country={item.country}
              description={item.description}
              featured={isActiveFeaturedListing(item)}
              showBoost={isOwner}
            />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <SellerCard
              uid={item.ownerId}
              name={item.ownerName}
              location={item.location}
            />

            <ActionButtons
              whatsappLink={whatsappLink}
              phone={item.phone}
              onChat={startChat}
              listingId={item.id}
              category={item.category}
              country={item.country}
            />

            <div className="rounded-lg border border-sky-500/25 bg-sky-500/5 p-4">
              <h3 className="mb-2 text-sm font-semibold text-sky-300">
                Stay Alert: Avoid Online Scams
              </h3>
              <ul className="space-y-1.5 text-xs leading-5 text-gray-400">
                <li>Never send money before inspecting the item.</li>
                <li>Meet in a public place for exchanges.</li>
                <li>Do not share OTPs or banking details.</li>
                <li>
                  If an ad looks fraudulent, email the listing link to{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-sky-300 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  . Read more on{" "}
                  <Link href="/safety" className="text-sky-300 hover:underline">
                    Safety
                  </Link>
                  .
                </li>
              </ul>
            </div>

            {isOwner && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/edit/${slug}`)}
                  className="rounded-lg bg-[#FBB03B] py-3 text-sm font-bold text-black"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded-lg border border-red-500/40 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            )}
          </aside>
        </div>

        <RelatedAds
          relatedAds={moreFromSeller}
          currencyMap={currencyMap}
          sellerName={
            sellerAds.length > 0
              ? item.ownerName || "this seller"
              : undefined
          }
        />
      </div>

      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
      />

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
