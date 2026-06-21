"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { db, auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

function getCreatedAtMs(createdAt: any): number {
  if (!createdAt) return 0;
  if (typeof createdAt.seconds === "number") {
    return (
      createdAt.seconds * 1000 +
      (createdAt.nanoseconds || 0) / 1e6
    );
  }
  if (createdAt instanceof Date) {
    return createdAt.getTime();
  }
  if (typeof createdAt.toDate === "function") {
    return createdAt.toDate().getTime();
  }
  return 0;
}

function randomIndexFromSeed(
  seed: number,
  max: number
): number {
  const x = Math.sin(seed) * 10000;
  return Math.floor(
    (x - Math.floor(x)) * (max + 1)
  );
}

function listingMatchesFilters(
  item: any,
  selectedCountry: string,
  selectedCategory: string,
  search: string,
  locationFilter: string
) {
  const matchCountry =
    selectedCountry === "" ||
    item.country === selectedCountry;

  const matchCategory =
  selectedCategory === "All" ||
  item.category
    ?.trim()
    .toLowerCase() ===
  selectedCategory
    .trim()
    .toLowerCase();

  const matchSearch = item.title
    ?.toLowerCase()
    .includes(search.toLowerCase());

  const matchLocation = item.location
    ?.toLowerCase()
    .includes(locationFilter.toLowerCase());

  return (
    matchCategory &&
    matchSearch &&
    matchLocation &&
    matchCountry
  );
}

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] =
  useState("All");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] =
  useState("");
  const [sortBy, setSortBy] =
  useState("newest");
  const [favorites, setFavorites] =
  useState<string[]>([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] =
  useState(0);

  const [pageLoadId] = useState(() =>
    Math.random()
  );
const bannerImages = [
  "/images/banner-ad-1.jpg",
  "/images/banner-ad-2.jpg",
  "/images/banner-ad-3.jpg",
];
const [showCategoryModal, setShowCategoryModal] =
  useState(false);
const [currentBanner, setCurrentBanner] = useState(0);
  const filteredListings = useMemo(
    () =>
      listings.filter((item) =>
        listingMatchesFilters(
          item,
          selectedCountry,
          selectedCategory,
          search,
          locationFilter
        )
      ),
    [
      listings,
      selectedCountry,
      selectedCategory,
      search,
      locationFilter,
    ]
  );
  const featuredListings = useMemo(
  () =>
    filteredListings.filter(
      (item) => item.featured === true
    ),
  [filteredListings]
);

const mixedListings = useMemo(() => {
  const normalAds = filteredListings.filter(
    (item) => !item.featured
  );

  const featuredAds = [...featuredListings];

  // rotate featured ads
  if (featuredAds.length > 1) {
    const shift =
      currentFeaturedIndex %
      featuredAds.length;

    featuredAds.push(
      ...featuredAds.splice(0, shift)
    );
  }

  const mixed = [...normalAds];

  featuredAds.forEach((ad) => {
    const randomPosition = Math.floor(
      Math.random() * (mixed.length + 1)
    );

    mixed.splice(randomPosition, 0, ad);
  });

  return mixed;
}, [
  filteredListings,
  featuredListings,
  currentFeaturedIndex,
]);

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

useEffect(() => {
  fetchListings();

  onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });
}, []);
const fetchListings =
  async () => {
    try {
      const q = query(
        collection(
          db,
          "listings"
        ),
        orderBy(
          "createdAt",
          "desc"
        )
      );
      

      const querySnapshot =
        await getDocs(q);

      const data =
  querySnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter(
      (listing: any) =>
        listing.approved === true &&
        listing.expired !== true
    );

      setListings(
        data
      );
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
  if (featuredListings.length <= 1) return;

  const interval = setInterval(() => {
    setCurrentFeaturedIndex(
      (prev) =>
        (prev + 1) %
        featuredListings.length
    );
  }, 5000);

  return () => clearInterval(interval);
}, [featuredListings]);

useEffect(() => {
  setCurrentFeaturedIndex(0);
}, [selectedCategory]);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentBanner((prev) =>
      prev === bannerImages.length - 1
        ? 0
        : prev + 1
    );
  }, 4000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  if (!user) return;

  const fetchFavorites = async () => {
    const snapshot = await getDocs(
      collection(
        db,
        "users",
        user.uid,
        "favorites"
      )
    );

    const favs = snapshot.docs.map(
      (doc) => doc.id
    );

    setFavorites(favs);
  };

  fetchFavorites();
}, [user]);


  const toggleFavorite =
  async (
    e: any,
    listingId: string
  ) => {
    e.preventDefault();

    if (!user) {
      alert(
        "Please login first"
      );
      return;
    }

    const favRef = doc(
      db,
      "users",
      user.uid,
      "favorites",
      listingId
    );

    const exists =
      favorites.includes(
        listingId
      );

    if (exists) {
      await deleteDoc(
        favRef
      );

      setFavorites(
        favorites.filter(
          (id) =>
            id !== listingId
        )
      );
    } else {
      await setDoc(
        favRef,
        {
          createdAt:
            new Date(),
        }
      );

      setFavorites([
        ...favorites,
        listingId,
      ]);
    }
  };
  const hour = new Date().getHours();

const greeting =
  hour < 12
    ? "🌅 Good Morning"
    : hour < 17
    ? "☀️ Good Afternoon"
    : "🌙 Good Evening";
  return (
    <main className="min-h-screen bg-[#020817]">
      <Navbar />
      <section className="w-full max-w-[1600px] mx-auto py-8 px-4 overflow-visible md:overflow-visible md:overflow-visible relative">
      

{/* Hero Banner */}
<div className="hidden md:block relative w-full rounded-[45px] border border-blue-900/30 bg-gradient-to-br from-[#050b18] via-[#0b1120] to-[#111827] p-6 md:p-10 overflow-visible md:overflow-visible shadow-[0_0_80px_rgba(59,130,246,0.08)]">

  {/* Glow */}
  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[140px]" />
  <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 blur-[120px]" />

  <div className="relative z-10 grid lg:grid-cols-[1fr_1.1fr] gap-8 items-center pt-10 md:pt-0">

    {/* LEFT SIDE */}
    <div className="flex flex-col justify-between h-full max-w-[620px]">

      <span className="inline-flex w-fit bg-blue-600 text-white px-5 py-3 rounded-full text-xs font-semibold">
        🚀 #1 Marketplace
      </span>

      <div className="mt-8">
        <h1 className="text-lg md:text-3xl sm:text-lg md:text-3xl md:text-7xl xl:text-8xl font-extrabold leading-[1.05] text-white">
          Buy, Sell &
          <span className="text-blue-500 block">
            Shop Smarter
          </span>
        </h1>

        <p className="text-gray-300 text-lg md:text-lg mt-6 max-w-xl leading-9">
          Discover electronics, vehicles,
          property, fashion and more on
          <span className="text-blue-400 font-semibold">
            {" "}Pippinway
          </span>{" "}
          — fast, trusted and easy.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 mt-10">
     {user ? (
  <Link
    href="/add-listing"
    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-5 rounded-[24px] font-semibold hover:scale-105 transition flex items-center gap-3"
  >
    ➕ Post Ad
  </Link>
) : (
  <Link
    href="/login"
    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-5 rounded-[24px] font-semibold hover:scale-105 transition flex items-center gap-3"
  >
    🔒 Login to Post Ad
  </Link>
)}

        <button
          onClick={() =>
            document
              .getElementById(
                "latest-listings"
              )
              ?.scrollIntoView({
                behavior: "smooth",
              })
          }
          className="border border-blue-500/30 bg-white/5 text-white px-8 py-5 rounded-[24px] hover:bg-blue-500/10 transition flex items-center gap-3"
        >
          🔍 Explore Listings
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-5 mt-10">
        {[
          {
            title: "50K+",
            text: "Happy Users",
          },
          {
            title: "10K+",
            text: "Active Listings",
          },
          {
            title: "24/7",
            text: "Trusted Support",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-[#0f172a] border border-white/10 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] rounded-[32px] p-2 md:p-8 text-center"
          >
            <h3 className="text-lg md:text-3xl md:text-4xl font-bold text-white">
              {item.title}
            </h3>

            <p className="text-gray-400 mt-2">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="bg-[#07101f] border border-blue-900/40 rounded-[40px] overflow-visible md:overflow-visible relative min-h-[580px] md:min-h-[860px] flex items-center justify-center">

      <div className="absolute inset-0 opacity-15 md:opacity-30">
        <img
          src="/images/world-map.png"
          alt=""
          className="w-full h-full object-contain bg-[#0f172a] opacity-80"
        />
      </div>

      <div className="relative z-10 pt-24 md:pt-14 px-5 pb-6 md:p-14">

        <img
          src="/images/logo.png"
          alt="Pippinway"
          className="w-[100px] md:w-[250px] lg:w-[320px] mx-auto mt-0 md:mt-0"
        />

        <h2 className="text-center text-white text-lg md:text-3xl md:text-4xl font-extrabold tracking-wide mt-5">
          WE SERVE IN
        </h2>

        <div className="w-44 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-2 mb-5 md:mb-8" />

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 px-2">
         {[
  { flag: "https://flagcdn.com/w40/gb.png", name: "UK" },
  { flag: "https://flagcdn.com/w40/us.png", name: "USA" },
  { flag: "https://flagcdn.com/w40/ca.png", name: "Canada" },
  { flag: "https://flagcdn.com/w40/lk.png", name: "Sri Lanka" },
  { flag: "https://flagcdn.com/w40/zw.png", name: "Zimbabwe" },
  { flag: "https://flagcdn.com/w40/in.png", name: "India" },
  { flag: "https://flagcdn.com/w40/sg.png", name: "Singapore" },
  { flag: "https://flagcdn.com/w40/th.png", name: "Thailand" },
  { flag: "https://flagcdn.com/w40/za.png", name: "South Africa" },
  { flag: "https://flagcdn.com/w40/mv.png", name: "Maldives" },
].map((country) => (
  <div
    key={country.name}
    className="bg-white/5 border border-white/10 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] rounded-[22px] md:rounded-[28px] py-2 px-4 md:p-6 text-xs md:text-lg text-center text-white font-semibold hover:border-blue-500 transition"
  >
    <div className="flex items-center justify-center gap-2 md:gap-3">
  <img
  src={country.flag}
  alt={country.name}
  className="w-9 h-7 object-contain bg-[#0f172a] rounded shadow-sm"
/>

      <span>
        {country.name}
      </span>
    </div>
  </div>
))}
</div>

        <div className="grid grid-cols-3 gap-2 mt-6 border-t border-white/10 pt-8">
          <div className="text-center">
            <div className="text-lg md:text-3xl md:text-4xl">
              🔒
            </div>
            <h3 className="block text-white text-lg py-3 px-4 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition">
              Safe & Secure
            </h3>
          </div>

          <div className="text-center">
            <div className="text-lg md:text-3xl md:text-4xl">
              ⚡
            </div>
            <h3 className="text-white font-bold mt-2">
              Fast & Easy
            </h3>
          </div>

          <div className="text-center">
            <div className="text-lg md:text-3xl md:text-4xl">
              🤝
            </div>
            <h3 className="text-white font-bold mt-2">
              Trusted
            </h3>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 items-stretch">
    <select
    
  value={selectedCountry}
  onChange={(e) =>
    setSelectedCountry(e.target.value)
  }
  className="bg-[#111827] border border-gray-700 text-white px-5 py-3 rounded-2xl outline-none focus:border-blue-500 w-full h-[56px]"
>
  <option value="">All Countries</option>
  <option value="Singapore">Singapore</option>
  <option value="India">India</option>
  <option value="Thailand">Thailand</option>
  <option value="Zimbabwe">Zimbabwe</option>
  <option value="USA">USA</option>
  <option value="Maldives">Maldives</option>
  <option value="Sri Lanka">Sri Lanka</option>
  <option value="South Africa">South Africa</option>
  <option value="United Kingdom">United Kingdom</option>
  <option value="Canada">Canada</option>
</select>
  <input
    type="text"
    placeholder="Filter by location"
    value={locationFilter}
    onChange={(e) =>
      setLocationFilter(
        e.target.value
      )
    }
   className="bg-[#111827] border border-gray-700 text-white placeholder-gray-400 px-5 py-3 rounded-2xl outline-none focus:border-blue-500 w-full h-[56px]"
  />
<input
  type="text"
  placeholder="Search products..."
  value={search}
  onChange={(e) =>
    setSearch(e.target.value)
  }
  className="bg-[#111827] border border-gray-700 text-white placeholder-gray-400 px-5 py-3 rounded-2xl outline-none focus:border-blue-500 w-full h-[56px]"
/>

 <select
  value={sortBy}
  onChange={(e) =>
    setSortBy(
      e.target.value
    )
  }
 className="bg-[#111827] border border-gray-700 text-white px-5 py-3 rounded-2xl outline-none focus:border-blue-500 w-full h-[56px]"

>
  <option value="newest">
    Newest First
  </option>

  <option value="oldest">
    Oldest First
  </option>

  <option value="low-high">
    Price: Low → High
  </option>

  <option value="high-low">
    Price: High → Low
  </option>
</select>
</div>
  
 <div className="mb-8">
   </div>

    {/* Categories */}
<select
  value={selectedCategory}
  onChange={(e) =>
    setSelectedCategory(e.target.value)
  }
  className="bg-[#111827] border border-gray-700 text-white px-5 py-3 rounded-2xl outline-none focus:border-blue-500 w-full h-[56px]"
>
  <option value="All">🌍 All Categories</option>
  <option value="Cars">🚗 Cars</option>
  <option value="Motorbikes">🏍️ Motorbikes</option>
  <option value="Property">🏠 Property</option>
  <option value="Electronics">📱 Electronics</option>
  <option value="Fashion">👕 Fashion</option>
  <option value="Jobs">💼 Jobs</option>
  <option value="Services">🛠️ Services</option>
  <option value="Animals">🐶 Animals</option>
  <option value="Furniture">🛋️ Furniture</option>
  <option value="Education">📚 Education</option>
  <option value="Other">📦 Other</option>
</select>

    <h1
  id="latest-listings"
  className="text-lg md:text-3xl md:text-4xl font-bold text-white mb-6"
>
  Latest Listings
</h1>

      {/* First 8 cards */}
      <div className="flex flex-col gap-2">
        {mixedListings
          .slice(0, 8)
          .map((item) => (
            <Link
              href={`/listings/${item.id}`}
              key={item.id}
              className={`group relative overflow-visible rounded-lg p-2 flex flex-row gap-3 items-start min-h-[90px]
${
  item.featured
    ? "bg-yellow-500/5 border border-yellow-500"
    : "bg-gradient-to-b from-[#0f172a] to-[#111827] border border-white/10"
}`}
              >
{item.featured && (
  <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg z-30">
    👑 FEATURED
  </div>
)}
   <button
  onClick={(e) => {
    toggleFavorite(
      e,
      item.id
    );
  }}
  className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 transition"
>
  {favorites.includes(item.id) ? (
    <span className="text-red-500 text-lg">
      ❤️
    </span>
  ) : (
    <span className="text-white text-lg">
      🤍
    </span>
  )}
     
</button>

       {item.imageUrl ? (
  <div className="relative w-[100px] h-[75px] flex-shrink-0 overflow-hidden rounded-md">
    <img
      src={item.imageUrl}
      alt={item.title}
      className="w-full h-full object-cover"
    />

 
  </div>
) : (
                <div className="w-full h-40 md:h-56 bg-[#1e293b] rounded-2xl flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
<div className="flex flex-col justify-between flex-1 min-w-0">

  <h2 className="font-semibold text-white text-[13px] leading-4 line-clamp-1">
    {item.title}
  </h2>

  <p className="text-blue-400 text-[11px]">
    {item.category}
  </p>

  <p className="text-gray-400 text-[11px]">
    {item.location}
  </p>

              <p className="text-gray-500 text-[11px]">
                🕒{" "}
                {item.createdAt
                  ? new Date(
                      item.createdAt.seconds *
                        1000
                    ).toLocaleDateString(
                      "en-GB"
                    )
                  : "Recently"}
              </p>

              <p className="text-green-400 font-bold text-[14px]">
                {currencyMap[
                  item.country
                    ?.trim()
                    ?.toLowerCase()
                ] || "Rs."}{" "}
                {Number(
                  item.price
                ).toLocaleString()}
              </p>
              </div>
            </Link>
          ))}
      </div>
    
      {/* Banner */}
 <div className="my-5">

  <img
    src={bannerImages[currentBanner]}
    alt="Banner"
    className="w-full h-[90px] md:h-[120px] object-contain bg-[#0f172a] rounded-[20px]"
  />
</div>

      {/* Remaining cards */}
      <div className="flex flex-col gap-2">
        {mixedListings
          .slice(8)
          .map((item) => (
            <Link
              href={`/listings/${item.id}`}
              key={item.id}
              className={`group relative overflow-visible rounded-lg p-2 flex flex-row gap-3 items-start min-h-[90px]
${
  item.featured
    ? "bg-yellow-500/5 border border-yellow-500"
    : "bg-gradient-to-b from-[#0f172a] to-[#111827] border border-white/10"
}`}
            >
{item.featured && (
  <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg z-30">
    👑 FEATURED
  </div>
)}
        <button
  onClick={(e) => {
    toggleFavorite(
      e,
      item.id
    );
  }}
  className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 transition"
>
  {favorites.includes(item.id) ? (
    
    <span className="text-red-500 text-lg">
      ❤️
    </span>
  ) : (
    <span className="text-white text-lg">
      🤍
    </span>
  )}
</button>

             {item.imageUrl ? (
 <div className="w-[100px] h-[75px] flex-shrink-0 overflow-visible rounded-md">
  <img
    src={item.imageUrl}
    alt={item.title}
    className="w-full h-full object-cover"
  />
</div>
) : (
                <div className="w-full h-40 md:h-56 bg-[#1e293b] rounded-2xl flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
<div className="flex flex-col justify-between flex-1 min-w-0">
              <h2 className="font-semibold text-white text-[13px] leading-4 line-clamp-1">
                {item.title}
              </h2>

              <p className="text-blue-400 text-[11px]">
                {item.category}
              </p>

              <p className="text-gray-400 text-[11px]">
                {item.location}
              </p>

              <p className="text-gray-500 text-[11px]">
                🕒{" "}
                {item.createdAt
                  ? new Date(
                      item.createdAt.seconds *
                        1000
                    ).toLocaleDateString(
                      "en-GB"
                    )
                  : "Recently"}
              </p>

              <p className="text-green-400 font-bold text-[14px]">
                {currencyMap[
                  item.country
                    ?.trim()
                    ?.toLowerCase()
                ] || "Rs."}{" "}
                {Number(
                  item.price
                ).toLocaleString()}
              </p>
              </div>
            </Link>
          ))}
      </div>

</section>
      <footer className="mt-32 border-t border-gray-800 bg-[#020817]">
  <div className="max-w-7xl mx-auto px-4 py-14">

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

      {/* Logo */}
      <div>
        <img
          src="/images/logo.png"
          className="w-[220px] mb-4"
        />

        <p className="text-gray-400 leading-7 text-xs md:text-lg">
          Buy, sell and explore products
          worldwide with Pippinway —
          trusted, fast and easy.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-white font-bold text-lg md:text-lg mb-4">
          Quick Links
        </h3>

        <div className="flex flex-col gap-3 text-gray-400 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition">
          <Link href="/">
            Home
          </Link>

          <Link href="/add-listing">
            Add Listing
          </Link>

          <Link href="/profile">
            Profile
          </Link>

          <Link href="/login">
            Login
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-white font-bold text-lg md:text-lg mb-4">
          Categories
        </h3>

        <div className="flex flex-row md:flex-col gap-3 text-gray-400">
          <span>Cars</span>
          <span>Property</span>
          <span>Electronics</span>
          <span>Jobs</span>
          <span>Fashion</span>
        </div>
      </div>

      {/* Countries */}
      <div>
        <h3 className="text-white font-bold text-lg md:text-lg mb-4">
          Available Countries
        </h3>

        <div className="flex flex-wrap gap-2">
          {[
            "🇬🇧 UK",
            "🇺🇸 USA",
            "🇨🇦 Canada",
            "🇱🇰 Sri Lanka",
            "🇿🇼 Zimbabwe",
            "🇮🇳 India",
          ].map((country) => (
            <span
              key={country}
              className="bg-[#111827] border border-gray-700 text-gray-300 px-3 py-2 rounded-xl text-xs"
            >
              {country}
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400 text-lg">
      © 2026 Pippinway.com — All Rights Reserved
    </div>
  </div>
</footer>
<Link
  href="/add-listing"
  style={{
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 99999,
  }}
  className="
    md:hidden
    bg-yellow-400
    text-black
    font-bold
    px-8
    py-4
    rounded-full
    shadow-2xl
    flex
    items-center
    gap-2
  "
>
  ➕ Post Ad
</Link>
    </main>
  );
}



