import { flagEmojiFromIso2, flagImageUrl } from "@/lib/countries";

type CountryFlagProps = {
  iso2: string;
  title?: string;
  className?: string;
};

/**
 * Site body fonts (Arial / Geist) draw regional-indicator pairs as ISO
 * letters (ZW, LK). Render the same ISO2 as a Twemoji flag image so the
 * glyph looks like an emoji on Windows and Android.
 */
export default function CountryFlag({
  iso2,
  title,
  className = "h-10 w-10",
}: CountryFlagProps) {
  const emoji = flagEmojiFromIso2(iso2);

  return (
    <span
      role="img"
      aria-label={title ?? `${iso2} flag`}
      title={title}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <img
        src={flagImageUrl(iso2)}
        alt=""
        draggable={false}
        className="h-full w-full object-contain"
      />
      <span className="sr-only">{emoji}</span>
    </span>
  );
}
