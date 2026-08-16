type Props = {
  count?: number;
};

export default function LatestHeading({ count = 0 }: Props) {
  return (
    <div className="mb-3 mt-2">
      <h2 id="latest-listings" className="text-lg font-bold text-white">
        Latest Ads
      </h2>
      {count > 0 && (
        <p className="text-xs text-gray-500 mt-0.5">{count} ads</p>
      )}
    </div>
  );
}
