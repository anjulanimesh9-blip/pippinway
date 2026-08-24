import { HOME_PAGE_SIZE } from "@/app/hooks/useListings";

type Props = {
  count?: number;
  total?: number;
  from?: number;
  to?: number;
};

export default function LatestHeading({
  count = 0,
  total = 0,
  from = 0,
  to = 0,
}: Props) {
  const label =
    total > HOME_PAGE_SIZE
      ? `Showing ${from}–${to} of ${total}`
      : count > 0
        ? `${count} ads`
        : null;

  return (
    <div className="mb-3 mt-2">
      <h2 id="latest-listings" className="text-lg font-bold text-white">
        Latest Ads
      </h2>
      {label && <p className="text-xs text-gray-500 mt-0.5">{label}</p>}
    </div>
  );
}
