"use client";

import Link from "next/link";

export default function Hero() {
  return (    
    <section>

     {/* Mobile Hero */}
<div className="md:hidden rounded-3xl bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#0f172a] border border-white/10 p-6 mb-6">

  <div className="flex justify-center">
    <img
      src="/images/logo.png"
      alt="Pippinway"
      className="w-20 h-20"
    />
  </div>

  <h1 className="text-3xl font-extrabold text-center text-white mt-4">
    Buy & Sell
  </h1>

  <p className="text-center text-gray-400 mt-2">
    Discover vehicles, property,
    electronics and more.
  </p>

  <div className="grid grid-cols-2 gap-3 mt-6">
    <div className="bg-[#111827] rounded-2xl p-4 text-center">
      🚗
      <p className="text-sm mt-2 text-white">
        Cars
      </p>
    </div>

    <div className="bg-[#111827] rounded-2xl p-4 text-center">
      📱
      <p className="text-sm mt-2 text-white">
        Electronics
      </p>
    </div>

    <div className="bg-[#111827] rounded-2xl p-4 text-center">
      🏠
      <p className="text-sm mt-2 text-white">
        Property
      </p>
    </div>

    <div className="bg-[#111827] rounded-2xl p-4 text-center">
      👕
      <p className="text-sm mt-2 text-white">
        Fashion
      </p>
    </div>
  </div>

  <div className="grid grid-cols-2 gap-3 mt-6">
    <Link
      href="/add-listing"
      className="bg-blue-600 rounded-2xl py-3 text-center font-semibold text-white"
    >
      ➕ Post Ad
    </Link>

    <button
      onClick={() =>
        document
          .getElementById("latest-listings")
          ?.scrollIntoView({
            behavior: "smooth",
          })
      }
      className="border border-white/20 rounded-2xl py-3 text-white"
    >
      🔍 Browse
    </button>
  </div>
</div>
      
     {/* Hero Banner */}
<div className="hidden md:block relative w-full rounded-[40px] border border-blue-900/30 bg-gradient-to-br from-[#050b18] via-[#0b1120] to-[#111827] px-8 py-8 overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.08)]">

  {/* Glow */}
  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[140px]" />
  <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 blur-[120px]" />

  <div className="relative z-10 grid lg:grid-cols-[1fr_1fr] gap-8 items-center">

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
      <div className="flex flex-wrap gap-4 mt-6">
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
      <div className="grid grid-cols-3 gap-3 md:gap-5 mt-6">
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
            className="bg-[#0f172a] border border-white/10 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] rounded-[32px] p-4 md:p-5 text-center"
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
    <div className="bg-[#07101f] border border-blue-900/40 rounded-[40px] overflow-visible md:overflow-visible relative min-h-[520px] md:min-h-[620px] flex items-center justify-center">

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
          className="w-[90px] md:w-[180px] lg:w-[220px] mx-auto mt-0 md:mt-0"
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
    className="bg-white/5 border border-white/10 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] rounded-[22px] md:rounded-[28px] py-2 px-4 md:p-4 text-xs md:text-lg text-center text-white font-semibold hover:border-blue-500 transition"
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
    </section>
  );
}