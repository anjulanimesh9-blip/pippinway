function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    const date = (value as { toDate: () => Date }).toDate();
    return isNaN(date.getTime()) ? null : date;
  }
  if (typeof (value as { seconds?: number }).seconds === "number") {
    const date = new Date((value as { seconds: number }).seconds * 1000);
    return isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export function vibeTimeAgo(value: unknown): string {
  const date = toDate(value);
  if (!date) return "";

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function vibeAbsoluteTime(value: unknown): string {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toMillis(value: unknown): number {
  return toDate(value)?.getTime() ?? 0;
}
