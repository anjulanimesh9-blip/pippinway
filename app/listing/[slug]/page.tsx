export default function ListingDetails() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <img
        src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
        alt="Product"
        className="w-full h-[400px] object-cover rounded-xl"
      />

      <h1 className="text-4xl font-bold mt-6">
        iPhone 14 Pro
      </h1>

      <p className="text-2xl font-bold mt-2">
        Rs. 320,000
      </p>

      <p className="text-gray-500 mt-2">
        Colombo
      </p>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">
          Description
        </h2>

        <p className="text-gray-700">
          Excellent condition iPhone 14 Pro for sale.
        </p>
      </div>
    </div>
  );
}