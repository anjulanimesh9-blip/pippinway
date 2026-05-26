"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";




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

    const data:
      any[] = [];

    querySnapshot.forEach(
      (doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        });
      }
    );

    setListings(
      data
    );
  };

  return (
    <main className="min-h-screen bg-[#020817]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-6 flex justify-between items-center">
  {user ? (
    <>
      <p className="font-semibold">
        Welcome, {user.email}
      </p>

      <button
        onClick={() => signOut(auth)}
        className="bg-black text-white px-4 py-2 rounded-xl"
      >
        Logout
      </button>
    </>
  ) : (
    <p>Not logged in</p>
  )}
</div>

<section className="w-full max-w-7xl mx-auto py-16 px-4 overflow-hidden">
  {/* Hero Banner */}
<div className="relative w-full overflow-hidden rounded-[35px] bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#1e293b] border border-gray-800 p-8 md:p-12 mb-10 shadow-2xl">
  
  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px]" />
  <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 blur-[100px]" />

  <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
    
    {/* Left Side */}
    <div>
      <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
        🚀 #1 Marketplace
      </span>

      <h1 className="text-5xl md:text-7xl font-extrabold text-white mt-6 leading-tight">
        Buy, Sell &
        <span className="text-blue-500">
          {" "}Shop Smarter
        </span>
      </h1>

      <p className="text-gray-300 text-lg mt-5 max-w-lg">
        Discover electronics, vehicles, property,
        fashion and more on Pippinway —
        fast, trusted and easy.
      </p>

      <div className="hidden md:flex gap-4 mt-8 flex-wrap">
        <Link
          href="/add-listing"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition"
        >
          + Post Ad
        </Link>

        <button
          className="border border-gray-600 text-white px-8 py-4 rounded-2xl hover:bg-white/10 transition"
        >
          Explore Listings
        </button>
      </div>
      </div>
      {/* Right Side Worldwide Card */}
<div className="relative">
  <div className="bg-[#0b1120] border border-blue-900/40 rounded-[35px] overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.15)]">

    <div className="bg-gradient-to-br from-[#07101f] to-[#0f172a] p-6 md:p-8">

      <div className="flex justify-center">
        <img
          src="/images/logo.png"
          alt="Pippinway"
          className="w-[220px] md:w-[320px] object-contain"
        />
      </div>

      <h3 className="text-center text-2xl md:text-3xl font-bold text-white mt-3">
        🌍 We Serve In
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
        {[
          "🇬🇧 UK",
          "🇺🇸 USA",
          "🇨🇦 Canada",
          "🇱🇰 Sri Lanka",
          "🇿🇼 Zimbabwe",
          "🇮🇳 India",
          "🇸🇬 Singapore",
          "🇹🇭 Thailand",
          "🇿🇦 South Africa",
          "🇲🇻 Maldives",
        ].map((country) => (
          <div
            key={country}
            className="bg-[#111827] border border-gray-800 rounded-2xl py-3 px-2 text-center text-white text-sm font-medium hover:border-blue-500 transition"
          >
            {country}
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
</div>
</div>

 <div className="mb-8">
    {/* Categories */}
<div className="mb-12">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-3xl font-bold text-white">
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
        className="bg-[#0f172a] border border-gray-800 hover:border-blue-500 hover:scale-105 transition rounded-[24px] p-4 min-h-[120px] flex flex-col items-center justify-center text-center shadow-lg"
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
    <h1 className="text-4xl font-bold text-white mb-6">
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
<div className="grid md:grid-cols-4 gap-6">
          {listings
.filter((item) => {
  const matchCountry =
  selectedCountry === ""
    ? true
    : item.country ===
      selectedCountry;
  const matchCategory =
    selectedCategory === "All"
      ? true
      : item.category ===
        selectedCategory;

  const matchSearch =
    item.title
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      );

  const matchLocation =
    item.location
      ?.toLowerCase()
      .includes(
        locationFilter.toLowerCase()
      );

        
return (
  matchCategory &&
  matchSearch &&
  matchLocation &&
  matchCountry
);
})
.sort((a, b) => {
  if (
    sortBy ===
    "newest"
  ) {
    return (
      (b.createdAt
        ?.seconds ||
        0) -
      (a.createdAt
        ?.seconds ||
        0)
    );
  }

  if (
    sortBy ===
    "oldest"
  ) {
    return (
      (a.createdAt
        ?.seconds ||
        0) -
      (b.createdAt
        ?.seconds ||
        0)
    );
  }

  if (
    sortBy ===
    "low-high"
  ) {
    return (
      Number(
        a.price
      ) -
      Number(
        b.price
      )
    );
  }

  if (
    sortBy ===
    "high-low"
  ) {
    return (
      Number(
        b.price
      ) -
      Number(
        a.price
      )
    );
  }

  return 0;
})
  .map((item) => (
            <Link
             href={`/listings/${item.id}`}
              key={item.id}
              className="bg-[#0f172a] border border-gray-800 rounded-[28px] shadow-xl p-4 block hover:scale-[1.02] hover:border-blue-500 transition duration-300 overflow-hidden"
            >
         {item.imageUrl ? (
  <img
    src={item.imageUrl}
    alt={item.title}
    className="w-full h-56 object-cover rounded-2xl"
  />
) : (
  <div className="w-full h-56 bg-[#1e293b] rounded-2xl flex items-center justify-center text-gray-500">
    No Image
  </div>
)}     
              <h2 className="text-xl font-bold text-white mt-4">
                {item.title}
              </h2>
 
<p className="text-sm text-blue-600 mb-2">
  {item.category}
</p>

<p className="text-gray-600 mb-2">
  {item.location}
</p>

<p className="text-gray-500 text-xs mt-2">
  🕒{" "}
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

<p className="text-2xl font-bold text-green-400">
  {
    currencyMap[
      item.country
        ?.trim()
        .toLowerCase()
    ] || "Rs."
  }{" "}
  {item.price}
</p>
         
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
