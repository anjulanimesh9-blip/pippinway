const listings = [
  {
    slug: "iphone-14-pro",
    title: "iPhone 14 Pro",
    location: "Colombo",
    price: "Rs. 320,000",
    image: "/images/phone.jpg",
    description: "Excellent condition iPhone 14 Pro for sale.",
  },

  {
    slug: "honda-vezel",
    title: "Honda Vezel",
    location: "Kandy",
    price: "Rs. 12,500,000",
    image: "/images/car.jpg",
    description: "Well maintained Honda Vezel.",
  },

  {
    slug: "apartment",
    title: "Apartment",
    location: "Negombo",
    price: "Rs. 1,550,000",
    image: "/images/apartment.jpg",
    description: "Luxury apartment available for sale.",
  },

  {
    slug: "macbook-pro",
    title: "MacBook Pro",
    location: "Galle",
    price: "Rs. 550,000",
    image: "/images/macbook.jpg",
    description: "Apple MacBook Pro in excellent condition.",
  },
];

export default async function ListingDetails({ params }: any) {
  const { slug } = await params;

  const listing = listings.find(
    (item) => item.slug === slug
  );

  if (!listing) {
    return <div className="p-10">Listing not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <img
        src={listing.image}
        alt={listing.title}
        className="w-full h-[400px] object-cover rounded-xl"
      />

      <h1 className="text-4xl font-bold mt-6">
        {listing.title}
      </h1>

      <p className="text-2xl font-bold mt-2">
        {listing.price}
      </p>

      <p className="text-gray-500 mt-2">
        {listing.location}
      </p>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">
          Description
        </h2>

        <p className="text-gray-700">
          {listing.description}
        </p>
      </div>
    </div>
  );
}