"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  deleteDoc,
  getDocs,
  collection,
  addDoc,
onSnapshot,
orderBy,
query,
serverTimestamp,
setDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import {
  useParams,
  useRouter,
} from "next/navigation";
import Link from "next/link";

export default function ListingDetails() {
  const [item, setItem] =
    useState<any>(null);

  const [relatedAds, setRelatedAds] =
    useState<any[]>([]);
    const [showChat, setShowChat] =
  useState(false);

  const [message, setMessage] =
  useState("");

const [messages, setMessages] =
  useState<any[]>([]);

    const [showDeleteModal, setShowDeleteModal] =
  useState(false);

  const currentUser =
    auth.currentUser;

  const router = useRouter();
  const params = useParams();

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

      router.push("/");
    };
    const sendMessage =
  async () => {

    console.log("clicked");

    console.log(currentUser);

    console.log(item);

    if (!currentUser?.email) {
      alert("Please login");
      return;
    }

    if (!message.trim()) {
      alert("Type message");
      return;
    }

   const sellerEmail =
  item?.ownerEmail ||
  item?.email;

    if (!sellerEmail) {
      alert("Seller not found");
      return;
    }

    const buyerEmail =
      currentUser.email;

    const chatId = [
      buyerEmail,
      sellerEmail,
      slug,
    ]
      .sort()
      .join("_");

    console.log(chatId);

    await setDoc(
      doc(db, "chats", chatId),
      {
        buyerEmail,
        sellerEmail,
        listingId: slug,
        lastMessage:
          message,
        updatedAt:
          serverTimestamp(),
      },
      { merge: true }
    );

    await addDoc(
      collection(
        db,
        "chats",
        chatId,
        "messages"
      ),
      {
        text: message,
        sender:
          buyerEmail,
        createdAt:
          serverTimestamp(),
      }
    );

    setMessage("");
  };
  useEffect(() => {
  if (!item || !currentUser?.email)
    return;

  const chatId = [
    currentUser.email,
    item.ownerEmail,
    slug,
  ]
    .sort()
    .join("_");

  const q = query(
    collection(
      db,
      "chats",
      chatId,
      "messages"
    ),
    orderBy(
      "createdAt",
      "asc"
    )
  );

  const unsubscribe =
    onSnapshot(
      q,
      (snapshot) => {
        setMessages(
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          )
        );
      }
    );

  return () =>
    unsubscribe();
}, [item, slug]);

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
  listingData.approved !==
  true
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
    ad.approved ===
      true
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

  const currency =
    currencyMap[
      item?.country
        ?.trim()
        ?.toLowerCase()
    ] || "Rs.";

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <div className="max-w-5xl mx-auto bg-gradient-to-b from-[#0f172a] to-[#111827] border border-white/10 rounded-[40px] shadow-[0_0_50px_rgba(59,130,246,0.08)] p-6 md:p-8">

        <button
          onClick={() =>
            router.push("/")
          }
          className="mb-6 bg-[#111] border border-gray-700 text-white px-4 py-2 rounded-2xl text-sm"
        >
          ← Back to Home
        </button>

<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
  {(
    item.imageUrls ||
    [item.imageUrl]
  )?.map(
    (
      image: string,
      index: number
    ) => (
      <div
        key={index}
        className="min-w-full snap-center relative"
      >
        <img
          src={image}
          alt={`Photo ${index}`}
          className="w-full h-[320px] md:h-[500px] object-contain bg-[#0f172a] border border-white/10 rounded-[32px] shadow-[0_0_40px_rgba(59,130,246,0.08)] p-4"
        />

        <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-4 py-2 rounded-full backdrop-blur-md">
          {index + 1} /{" "}
          {(
            item.imageUrls ||
            [item.imageUrl]
          ).length}
        </div>
      </div>
    )
  )}
</div>

        <h1 className="text-4xl font-bold mt-6">
          {item.title}
        </h1>

       <p className="text-4xl font-extrabold text-green-500 mt-3">
  {currency}{" "}
  {Number(item.price).toLocaleString()}
</p>

        <p className="flex items-center gap-2 text-blue-400 mt-3 font-medium">
          📂 {item.category}
        </p>

        <p className="flex items-center gap-2 text-gray-300 mt-2 text-lg">
          📍 {item.location}
        </p>
        <p className="text-gray-500 text-sm mt-2">
  🕒 Posted on{" "}
  {item.createdAt
    ? new Date(
        item.createdAt
          .seconds *
          1000
      ).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "Recently"}
</p>

        <h2 className="text-2xl font-bold mt-12 mb-5">
          Description
        </h2>

        <p className="text-gray-300 text-base md:text-lg leading-8 bg-white/5 border border-white/10 rounded-[24px] p-5">
          {item.description}
        </p>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">
          <a
            href={`https://wa.me/${item.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-green-600 to-green-500 hover:scale-105 transition text-white py-4 rounded-[24px] font-semibold text-sm text-center shadow-lg w-full"
          >
            WhatsApp Seller
          </a>

          <a
            href={`tel:${item.phone}`}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 transition text-white py-4 rounded-[24px] font-semibold text-sm text-center shadow-lg w-full"
          >
            Call Seller
          </a>
   <button
  onClick={() =>
    setShowChat(true)
  }
  className="bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:scale-105 transition text-white py-4 rounded-[24px] font-semibold text-sm text-center shadow-lg w-full flex items-center justify-center"
>
  💬 Chat Seller
</button>
        </div>

        {currentUser?.email ===
          item.ownerEmail && (
          <div className="grid grid-cols-2 gap-3 mt-5">
           <button
  onClick={() =>
    setShowDeleteModal(true)
  }
  className="bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-[22px] font-semibold shadow-lg hover:scale-[1.02] transition"
>
  Delete
</button>

            <button
              onClick={() =>
                router.push(
                  `/edit/${slug}`
                )
              }
              className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black py-4 rounded-[22px] font-semibold shadow-lg hover:scale-[1.02] transition"
            >
              Edit
            </button>
          </div>
        )}
{showDeleteModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
    <div className="bg-[#0f172a] border border-white/10 rounded-[30px] p-6 w-full max-w-sm text-center shadow-2xl">
      <h2 className="text-2xl font-bold text-white">
        Delete Listing?
      </h2>

      <p className="text-gray-400 mt-3">
        Are you sure you want to
        delete this listing?
      </p>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={() =>
            setShowDeleteModal(false)
          }
          className="bg-gray-700 text-white py-3 rounded-[18px]"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            await handleDelete();
          }}
          className="bg-red-600 text-white py-3 rounded-[18px]"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
        <h2 className="text-2xl font-bold mt-16 mb-6">
          Similar Ads
        </h2>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {relatedAds.map(
            (ad) => (
              <Link
                key={ad.id}
                href={`/listings/${ad.id}`}
                className="min-w-[240px] md:min-w-[280px] bg-[#111111] border border-gray-800 rounded-[28px] p-3 shadow-xl overflow-hidden snap-start"
              >
          <img
  src={
    ad.imageUrls?.[0] ||
    ad.imageUrl
  }
  alt={ad.title}
  className="w-full h-[170px] md:h-[190px] object-cover rounded-[24px]"
/>

                <h3 className="font-bold text-lg mt-3 text-white">
                  {ad.title}
                </h3>

                <p className="text-green-500 font-bold text-xl">
                  {(currencyMap[
                    ad.country
                      ?.trim()
                      ?.toLowerCase()
                  ] || "Rs.")}{" "}
                  {Number(ad.price).toLocaleString()}
                </p>

                <p className="text-gray-400 text-sm">
                  {ad.location}
                </p>
              </Link>
            )
          )}
        </div>
               {showChat && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-end justify-end p-5">

            <div className="w-[380px] h-[550px] bg-[#0f172a] border border-white/10 rounded-[30px] shadow-2xl flex flex-col overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#111827]">
                <h2 className="text-lg font-bold text-white">
                  💬 Chat Seller
                </h2>

                <button
                  onClick={() =>
                    setShowChat(false)
                  }
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

             {/* Messages */}
<div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b1120]">
  {messages.map((msg) => (
    <div
      key={msg.id}
      className={`max-w-[80%] p-3 rounded-[20px] ${
        msg.sender === currentUser?.email
          ? "bg-blue-600 ml-auto"
          : "bg-gray-700"
      }`}
    >
      {msg.text}
    </div>
  ))}
</div>
{/* Input */}
<div className="p-4 border-t border-white/10 bg-[#111827] flex gap-2">
  <input
    type="text"
    value={message}
    onChange={(e) =>
      setMessage(e.target.value)
    }
    placeholder="Type message..."
    className="flex-1 bg-[#0f172a] border border-white/10 rounded-[18px] px-4 py-3 text-white outline-none"
  />

  <button
    onClick={sendMessage}
    className="bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 rounded-[18px] font-semibold"
  >
    Send
  </button>
</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

