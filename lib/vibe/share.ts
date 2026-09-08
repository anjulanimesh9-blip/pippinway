import { SITE_URL } from "@/lib/site";
import { VIBE_PATHS } from "./constants";
import { trackVibe } from "@/lib/analytics";

export function vibePostUrl(id: string): string {
  return `${SITE_URL}${VIBE_PATHS.post(id)}`;
}

export function vibeShareText(text: string, url: string): string {
  const snippet = text.replace(/\s+/g, " ").trim().slice(0, 140);
  return snippet ? `${snippet} — ${url}` : url;
}

export async function shareVibePost(input: {
  id: string;
  text: string;
  category?: string;
  method: "native" | "whatsapp" | "facebook" | "copy";
}): Promise<"shared" | "copied" | "opened"> {
  const url = vibePostUrl(input.id);
  const text = vibeShareText(input.text, url);
  trackVibe("vibe_share", {
    post_id: input.id,
    vibe_category: input.category,
    share_method: input.method,
  });

  if (input.method === "whatsapp") {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
    return "opened";
  }

  if (input.method === "facebook") {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
    return "opened";
  }

  if (input.method === "native" && typeof navigator.share === "function") {
    await navigator.share({ title: "Pippinway Vibe", text: input.text.slice(0, 120), url });
    return "shared";
  }

  await navigator.clipboard.writeText(url);
  return "copied";
}

export function loveMatchUrl(a: string, b: string): string {
  return `${SITE_URL}${VIBE_PATHS.loveMatch}?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`;
}

export async function shareLoveMatch(input: {
  a: string;
  b: string;
  score: number;
  label: string;
  method: "native" | "whatsapp" | "facebook" | "copy";
}): Promise<"shared" | "copied" | "opened"> {
  const url = loveMatchUrl(input.a, input.b);
  const text = `Love Match ${input.score}% — ${input.label}. ${url}`;
  trackVibe("vibe_share", {
    vibe_category: "love-relationships",
    share_method: input.method,
    sign: `${input.a}-${input.b}`,
  });

  if (input.method === "whatsapp") {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    return "opened";
  }
  if (input.method === "facebook") {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
    return "opened";
  }
  if (input.method === "native" && typeof navigator.share === "function") {
    await navigator.share({ title: "Pippinway Love Match", text, url });
    return "shared";
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}
