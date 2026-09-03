import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicListingBySlug, isPublicListing } from "@/lib/getPublicListing";
import {
  jsonLdScript,
  listingJsonLd,
  listingMetadata,
} from "@/lib/listingSeo";
import ListingClient from "./ListingClient";

type ListingPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getPublicListingBySlug(slug);
  return listingMetadata(slug, listing);
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await getPublicListingBySlug(slug);

  if (!listing || !isPublicListing(listing)) {
    notFound();
  }

  const jsonLd = listingJsonLd(slug, listing);

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
        />
      ) : null}
      <ListingClient initialItem={listing} />
    </>
  );
}
