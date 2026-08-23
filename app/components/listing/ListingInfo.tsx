"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";

type ListingInfoProps = {
  title?: string;
  price: unknown;
  currency?: string;
  category: string;
  location: string;
  createdAt?: any;
  description: string;
  featured?: boolean;
  country?: string;
  showBoost?: boolean;
};

export default function ListingInfo({
  title,
  price,
  currency,
  category,
  location,
  description,
  featured = false,
  country,
  showBoost = false,
}: ListingInfoProps) {
  const [expanded, setExpanded] = useState(false);
  const longText = (description || "").length > 280;

  const specs = [
    ["Category", category],
    ["Location", location],
    ["Country", country],
    ["Type", featured ? "Featured listing" : "Standard listing"],
  ].filter(([, value]) => Boolean(value));

  return (
    <div>
      {title && (
        <h1 className="mb-3 text-xl font-bold text-white sm:text-2xl">{title}</h1>
      )}
      <p className="mt-4 text-2xl font-bold text-emerald-400 sm:text-[28px]">
        {formatPrice(price, country)}
      </p>

      <div className="mt-6 border-t border-white/10 pt-4">
        <dl className="grid grid-cols-1 sm:grid-cols-2">
          {specs.map(([label, value]) => (
            <div
              key={label}
              className="flex gap-3 border-b border-white/5 py-2.5 text-sm"
            >
              <dt className="w-28 shrink-0 text-gray-500">{label}:</dt>
              <dd className="font-medium text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <h2 className="mb-3 text-base font-semibold text-white">Description</h2>
        <p
          className={`whitespace-pre-line text-sm leading-7 text-gray-300 ${
            expanded || !longText ? "" : "line-clamp-5"
          }`}
        >
          {description || "No description provided."}
        </p>
        {longText && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-sm font-semibold text-sky-400 hover:underline"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {showBoost && !featured && (
        <Link
          href="/featured-packages"
          className="mt-6 flex w-full items-center justify-center rounded-md bg-[#FBB03B] py-3 text-sm font-bold text-black hover:bg-[#ffc14d]"
        >
          Boost this ad
        </Link>
      )}
    </div>
  );
}
