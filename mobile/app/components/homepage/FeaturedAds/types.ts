export type Listing = {
  id: string;
  title: string;
  imageUrl?: string;
  imageUrls?: string[];
  price?: number;
  currency?: string;
  featured?: boolean;
  category?: string;
  location?: string;
  slug?: string;
};