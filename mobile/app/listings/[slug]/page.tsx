"use client";

import { useEffect, useState } from "react";
import ImageGallery from "@/app/components/listing/ImageGallery";
import ListingInfo from "@/app/components/listing/ListingInfo";
import ActionButtons from "@/app/components/listing/ActionButtons";
import SellerCard from "@/app/components/listing/SellerCard";
import RelatedAds from "@/app/components/listing/RelatedAds";
import DeleteModal from "@/app/components/listing/DeleteModal";
import MobileBottomNav from "../../components/MobileBottomNav";
import {
  doc,
  getDoc,
  deleteDoc,
  getDocs,
  collection,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { isLiveListing } from "@/lib/filterListings";
import {
  useParams,
  useRouter,
} from "next/navigation";

export default function ListingDetails() {
  const [item, setItem] =
    useState<any>(null);

  const [relatedAds, setRelatedAds] =
    useState<any[]>([]);
  
    const [showDeleteModal, setShowDeleteModal] =
  useState(false);

  const currentUser =
    auth.currentUser;

  const router = useRouter();
  const params = useParams();

  const slug =
    params?.slug as string;


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

      router.push("/");
    };
   
const startChat = async () => {
  if (!currentUser?.email) {
    alert("Please login first.");
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
  router.push("/");
  return;
}
            setItem(
              listingData
            );

            const querySnapshot =
              await getDocs(
                collection(
                  db,
                  "listings"
                )
              );

            const filteredAds =
              querySnapshot.docs
                .map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }))
                .filter(
  (ad: any) =>
    ad.category ===
      listingData.category &&
    ad.id !== slug &&
    ad.approved === true &&
    isLiveListing(ad)
);
                

            setRelatedAds(
              filteredAds
            );
          }
        } catch (error) {
          console.error(error);
        }
      };

    fetchListing();
  }, [slug]);

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

 return (
  <main className="min-h-screen bg-black text-white pb-20 lg:pb-0">

    <div className="p-5">
      <div className="max-w-5xl mx-auto bg-gradient-to-b from-[#0f172a] to-[#111827] border border-white/10 rounded-[40px] shadow-[0_0_50px_rgba(59,130,246,0.08)] p-6 md:p-8">

        <button
          onClick={() => router.push("/")}
          className="mb-6 bg-[#111] border border-gray-700 text-white px-4 py-2 rounded-2xl text-sm"
        >
          ← Back to Home
        </button>

        <div className="space-y-4">
          <ImageGallery
            imageUrls={item.imageUrls}
            imageUrl={item.imageUrl}
            title={item.title}
          />
        </div>

        <ListingInfo
          title={item.title}
          price={item.price ?? item.amount}
          country={item.country}
          category={item.category}
          location={item.location}
          createdAt={item.createdAt}
          description={item.description}
        />

        <ActionButtons
          whatsappLink={whatsappLink}
          phone={item.phone}
          onChat={startChat}
        />

        <SellerCard
          uid={item.ownerId}
          name={item.ownerName}
          phone={item.phone}
          location={item.location}
        />

        {currentUser?.email === item.ownerEmail && (
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-[22px] font-semibold shadow-lg hover:scale-[1.02] transition"
            >
              Delete
            </button>

            <button
              onClick={() => router.push(`/edit/${slug}`)}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black py-4 rounded-[22px] font-semibold shadow-lg hover:scale-[1.02] transition"
            >
              Edit
            </button>
          </div>
        )}

        <DeleteModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDelete}
        />

        <RelatedAds
          relatedAds={relatedAds}
        />

      </div>
    </div>

    {/* Mobile Bottom Navigation */}
    <MobileBottomNav />

  </main>
);
}

