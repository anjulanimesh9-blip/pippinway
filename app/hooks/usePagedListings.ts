"use client";

import { useEffect, useMemo, useState } from "react";
import { HOME_PAGE_SIZE } from "./useListings";

export default function usePagedListings<T>(
  items: T[],
  resetKey: string,
  pageSize: number = HOME_PAGE_SIZE
) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return {
    page,
    pageItems,
    total,
    totalPages,
    from,
    to,
    hasPrev: page > 1,
    hasNext: page < totalPages && total > 0,
    goPrev: () => setPage((current) => Math.max(1, current - 1)),
    goNext: () => setPage((current) => Math.min(totalPages, current + 1)),
  };
}
