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
    item.category?.trim() === selectedCategory.trim();

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

  const [pageLoadId] = useState(() =>
    Math.random()
  );

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
    const normalAds = filteredListings
      .filter((item) => !item.featured)
      .sort(
        (a, b) =>
          getCreatedAtMs(b.createdAt) -
          getCreatedAtMs(a.createdAt)
      );

    const featuredAds =
      featuredListings.slice(0, 4);

    const mixed = [...normalAds];

    featuredAds.forEach((ad, index) => {
      const seed =
        pageLoadId * 1000 +
        index +
        ad.id.length;
      const randomIndex =
        randomIndexFromSeed(
          seed,
          mixed.length
        );
      mixed.splice(randomIndex, 0, ad);
    });

    return mixed;
  }, [filteredListings, featuredListings, pageLoadId]);

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
              listing.approved ===
              true
          );

      setListings(
        data
      );
    } catch (error) {
      console.log(error);
    }
  };

useEffect(() => {
  if (!user) return;
  

  const fetchFavorites =
    async () => {
      const snapshot =
        await getDocs(
          collection(
            db,
            "users",
            user.uid,
            "favorites"
          )
        );

      const favs =
        snapshot.docs.map(
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
  return (
    <main className="min-h-screen bg-[#020817]">
      <Navbar />
      <section className="w-full max-w-[1600px] mx-auto py-8 px-4 overflow-visible md:overflow-visible md:overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 pt-6 flex flex-col md:flex-row gap-3 md:gap-0 justify-between items-start md:items-center">
  {user ? (
    <>
      <p className="font-semibold text-gray-300">
        Welcome, {user.email}
      </p>

      <button
        onClick={() => signOut(auth)}
        className="bg-black text-white px-4 py-2 rounded-xl w-fit"
      >
        Logout
      </button>
    </>
  ) : (
    <p>Not logged in</p>
  )}
</div>

{/* Hero Banner */}
<div className="relative w-full rounded-[28px] md:rounded-[45px] border border-blue-900/30 bg-gradient-to-br from-[#050b18] via-[#0b1120] to-[#111827] p-6 md:p-10 overflow-visible md:overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.08)]">

  {/* Glow */}
  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[140px]" />
  <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 blur-[120px]" />

  <div className="relative z-10 grid lg:grid-cols-[1fr_1.1fr] gap-8 items-center pt-10 md:pt-0">

    {/* LEFT SIDE */}
    <div className="flex flex-col justify-between h-full max-w-[620px]">

      <span className="inline-flex w-fit bg-blue-600 text-white px-5 py-3 rounded-full text-sm font-semibold">
        🚀 #1 Marketplace
      </span>

      <div className="mt-8">
        <h1 className="text-3xl sm:text-3xl md:text-7xl xl:text-8xl font-extrabold leading-[1.05] text-white">
          Buy, Sell &
          <span className="text-blue-500 block">
            Shop Smarter
          </span>
        </h1>

        <p className="text-gray-300 text-xl mt-6 max-w-xl leading-9">
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
        <Link
          href="/add-listing"
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-5 rounded-[24px] font-semibold hover:scale-105 transition flex items-center gap-3"
        >
          ➕ Post Ad
        </Link>

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
            className="bg-[#0f172a] border border-white/10 rounded-[32px] p-4 md:p-8 text-center"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-white">
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
    <div className="bg-[#07101f] border border-blue-900/40 rounded-[40px] overflow-visible md:overflow-hidden relative min-h-[580px] md:min-h-[860px] flex items-center justify-center">

      <div className="absolute inset-0 opacity-15 md:opacity-30">
        <img
          src="/images/world-map.png"
          alt=""
          className="w-full h-full object-cover opacity-80"
        />
      </div>

      <div className="relative z-10 pt-24 md:pt-14 px-5 pb-6 md:p-14">

        <img
          src="/images/logo.png"
          alt="Pippinway"
          className="w-[100px] md:w-[250px] lg:w-[320px] mx-auto mt-0 md:mt-0"
        />

        <h2 className="text-center text-white text-3xl md:text-4xl font-extrabold tracking-wide mt-5">
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
    className="bg-white/5 border border-white/10 rounded-[22px] md:rounded-[28px] py-2 px-4 md:p-6 text-sm md:text-lg text-center text-white font-semibold hover:border-blue-500 transition"
  >
    <div className="flex items-center justify-center gap-2 md:gap-3">
  <img
  src={country.flag}
  alt={country.name}
  className="w-9 h-7 object-cover rounded shadow-sm"
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
            <div className="text-3xl md:text-4xl">
              🔒
            </div>
            <h3 className="block text-white text-lg py-3 px-4 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition">
              Safe & Secure
            </h3>
          </div>

          <div className="text-center">
            <div className="text-3xl md:text-4xl">
              ⚡
            </div>
            <h3 className="text-white font-bold mt-2">
              Fast & Easy
            </h3>
          </div>

          <div className="text-center">
            <div className="text-3xl md:text-4xl">
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

 <div className="mb-8">
    {/* Categories */}
<div className="mb-14 mt-6">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide text-white">
      Shop by Category
    </h2>

    <button className="text-blue-400 hover:text-blue-300">
      View All →
    </button>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
{[
  {
    name: "Cars",
    icon: "🚗",
  },
  {
    name: "Motorbikes",
    icon: "🏍️",
  },
  {
    name: "Property",
    icon: "🏠",
  },
  {
    name: "Electronics",
    icon: "📱",
  },
  {
    name: "Fashion",
    icon: "👕",
  },
  {
    name: "Jobs",
    icon: "💼",
  },
  {
    name: "Services",
    icon: "🛠️",
  },
  {
    name: "Animals",
    icon: "🐶",
  },
  {
    name: "Furniture",
    icon: "🛋️",
  },
  {
    name: "Education",
    icon: "📚",
  },
  {
    name: "Other",
    icon: "📦",
  },
].map((cat) => (
      <button
        key={cat.name}
        onClick={() =>
          setSelectedCategory(
            cat.name
          )
        }
        className="bg-[#0f172a] border border-gray-800 hover:border-blue-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition rounded-[24px] p-4 min-h-[120px] flex flex-col items-center justify-center text-center shadow-lg"
      >
        <div className="text-5xl mb-3">
          {cat.icon}
        </div>

        <h3 className="text-white font-semibold text-lg">
          {cat.name}
        </h3>
      </button>
    ))}
  </div>
</div>
{/* ⭐ Featured Listings */}
{featuredListings.length > 0 && (
  <div className="mb-14">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
      <h2 className="text-3xl md:text-4xl font-extrabold text-yellow-400">
        ⭐ Featured Listings
      </h2>

      <span className="text-yellow-300 text-sm font-medium">
  ⭐ Premium Ads
</span>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
  {featuredListings
  .slice(0, 8)
  .map((item) => (
          <Link
            href={`/listings/${item.id}`}
            key={item.id}
            className="group relative flex flex-col bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/40 rounded-[30px] p-4 hover:scale-[1.03] transition overflow-hidden min-h-[420px]"
          >
            <div className="absolute top-4 left-4 bg-yellow-500 text-black text-xs px-3 py-1 rounded-full font-bold z-10">
              👑 FEATURED
            </div>

            <img
              src={
                item.imageUrl
              }
              alt={
                item.title
              }
              className="w-full h-56 object-cover rounded-[22px]"
            />

            <h2 className="text-xl font-bold text-white mt-4">
              {item.title}
            </h2>

            <p className="text-sm text-blue-400">
              {
                item.category
              }
            </p>

            <p className="text-gray-400">
              {
                item.location
              }
            </p>

            <p className="text-3xl font-extrabold text-green-400 mt-3">
              {currencyMap[
                item.country
                  ?.trim()
                  .toLowerCase()
              ] || "Rs."}{" "}
              {Number(
                item.price
              ).toLocaleString()}
            </p>
          </Link>
        ))}
    </div>
  </div>
)}

    <h1
  id="latest-listings"
  className="text-3xl md:text-4xl font-bold text-white mb-6"
>
  Latest Listings
</h1>

  </div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 items-stretch">
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
  <div className="flex gap-3 mb-8 flex-wrap">
  {[
  "All",
  "Cars",
  "Motorbikes",
  "Property",
  "Electronics",
  "Fashion",
  "Jobs",
  "Services",
  "Animals",
  "Furniture",
  "Education",
  "Other",
].map((cat) => (
    <button
      key={cat}
      onClick={() =>
        setSelectedCategory(cat)
      }
      className={`px-4 py-2 rounded-xl border ${
        selectedCategory === cat
          ? "bg-black text-white"
          : "bg-white"
      }`}
    >
      {cat}
    </button>
  ))}
</div>
<>
      {/* First 8 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mixedListings
          .slice(0, 8)
          .map((item) => (
            <Link
              href={`/listings/${item.id}`}
              key={item.id}
              className="group relative min-h-[380px] flex flex-col bg-gradient-to-b from-[#0f172a] to-[#111827] border border-white/10 rounded-[30px] p-4 block"
            >
              {item.featured && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-black text-xs px-3 py-1 rounded-full font-bold z-10">
                  👑 Featured
                </div>
              )}
  <button
  onClick={(e) => {
    toggleFavorite(
      e,
      item.id
    );
  }}
  className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 transition"
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
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-56 object-cover rounded-[22px]"
                />
              ) : (
                <div className="w-full h-56 bg-[#1e293b] rounded-2xl flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}

              <h2 className="text-xl font-bold text-white mt-4">
                {item.title}
              </h2>

              <p className="text-sm text-blue-600">
                {item.category}
              </p>

              <p className="text-gray-500">
                {item.location}
              </p>

              <p className="text-gray-500 text-xs mt-2">
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

              <p className="text-3xl font-extrabold text-green-400 mt-2">
                {currencyMap[
                  item.country
                    ?.trim()
                    ?.toLowerCase()
                ] || "Rs."}{" "}
                {Number(
                  item.price
                ).toLocaleString()}
              </p>
            </Link>
          ))}
      </div>

      {/* Banner */}
      <div className="my-5">
        <img
          src="/images/banner-ad.jpg"
          alt="Banner"
          className="w-full h-[90px] md:h-[120px] object-cover rounded-[20px]"
        />
      </div>

      {/* Remaining cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mixedListings
          .slice(8)
          .map((item) => (
            <Link
              href={`/listings/${item.id}`}
              key={item.id}
              className="group relative min-h-[380px] flex flex-col bg-gradient-to-b from-[#0f172a] to-[#111827] border border-white/10 rounded-[30px] p-4 block"
            >
              {item.featured && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-black text-xs px-3 py-1 rounded-full font-bold z-10">
                  👑 Featured
                </div>
              )}
  <button
  onClick={(e) => {
    toggleFavorite(
      e,
      item.id
    );
  }}
  className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 transition"
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
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-56 object-cover rounded-[22px]"
                />
              ) : (
                <div className="w-full h-56 bg-[#1e293b] rounded-2xl flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}

              <h2 className="text-xl font-bold text-white mt-4">
                {item.title}
              </h2>

              <p className="text-sm text-blue-600">
                {item.category}
              </p>

              <p className="text-gray-500">
                {item.location}
              </p>

              <p className="text-gray-500 text-xs mt-2">
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

              <p className="text-3xl font-extrabold text-green-400 mt-2">
                {currencyMap[
                  item.country
                    ?.trim()
                    ?.toLowerCase()
                ] || "Rs."}{" "}
                {Number(
                  item.price
                ).toLocaleString()}
              </p>
            </Link>
          ))}
      </div>
</>

</section>
      <footer className="mt-32 border-t border-gray-800 bg-[#020817]">
  <div className="max-w-7xl mx-auto px-4 py-14">

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

      {/* Logo */}
      <div>
        <img
          src="/images/logo.png"
          alt="Pippinway"
          className="w-[220px] mb-4"
        />

        <p className="text-gray-400 leading-7 text-sm md:text-base">
          Buy, sell and explore products
          worldwide with Pippinway —
          trusted, fast and easy.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-white font-bold text-xl mb-4">
          Quick Links
        </h3>

        <div className="text-white text-lg py-3 px-4 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition">
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
        <h3 className="text-white font-bold text-xl mb-4">
          Categories
        </h3>

        <div className="flex flex-col gap-3 text-gray-400">
          <span>Cars</span>
          <span>Property</span>
          <span>Electronics</span>
          <span>Jobs</span>
          <span>Fashion</span>
        </div>
      </div>

      {/* Countries */}
      <div>
        <h3 className="text-white font-bold text-xl mb-4">
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
              className="bg-[#111827] border border-gray-700 text-gray-300 px-3 py-2 rounded-xl text-sm"
            >
              {country}
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400 text-base">
      © 2026 Pippinway.com — All Rights Reserved
    </div>
  </div>
</footer>
    </main>
  );
}



