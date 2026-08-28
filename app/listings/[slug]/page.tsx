import type { Metadata } from "next";
import { getPublicListingBySlug } from "@/lib/getPublicListing";
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
  const jsonLd = listingJsonLd(slug, listing);

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
        />
      ) : null}
      <ListingClient />
    </>
  );
}
