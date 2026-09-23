export function ScannerSkeletons({ count = 15 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-white/10 bg-[#0B1220] p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
            <div className="ml-auto h-5 w-14 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="mt-4 h-8 w-32 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/5" />
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}
