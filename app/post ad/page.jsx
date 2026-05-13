const listings = [
  {
    id: 1,
    title: "iPhone 14 Pro",
    price: "$900",
    location: "Harare",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  },
  {
    id: 2,
    title: "Honda Fit",
    price: "$6500",
    location: "Bulawayo",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
  },
];

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-8">Latest Listings</h1>
      <input
  type="text"
  placeholder="Search listings..."
  value={search}
  onChange={(e) =>
    setSearch(e.target.value)
  }
  className="w-full border p-4 rounded-xl mb-6"
/>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{listings
  .filter((item) => {
    const matchesCategory =
      selectedCategory === "All"
        ? true
        : item.category === selectedCategory;

    const matchesSearch =
      item.title
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  })
  .map((item) => (
          <div
            key={item.id}
            className="border rounded-xl overflow-hidden shadow-sm"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-52 object-cover"
            />

            <div className="p-4">
              <h2 className="text-xl font-semibold">{item.title}</h2>

              <p className="text-lg font-bold mt-2">{item.price}</p>

              <p className="text-gray-500">{item.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
