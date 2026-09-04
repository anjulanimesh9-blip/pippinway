"use client";

import { useMemo, useState } from "react";
import {
  APP_LANGUAGES,
  preferredLanguagesForCountry,
  rankedLanguagesForCountry,
  useI18n,
  type LanguageCode,
} from "@/lib/i18n";
import useCountryNavigation from "@/app/hooks/useCountryNavigation";
import { COUNTRY_STORAGE_KEY, getCountryByFirestoreValue } from "@/lib/countries";

function storedCountryValue(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(COUNTRY_STORAGE_KEY) ??
    localStorage.getItem("country")
  );
}

type LanguageSwitcherProps = {
  compact?: boolean;
  className?: string;
};

export default function LanguageSwitcher({
  compact = false,
  className = "",
}: LanguageSwitcherProps) {
  const { language, t, countryLabel, requestLanguageChange } = useI18n();
  const { market } = useCountryNavigation();
  const [open, setOpen] = useState(false);

  const countryValue =
    market?.firestoreValue ??
    storedCountryValue() ??
    null;

  const preferredSet = useMemo(
    () => new Set(preferredLanguagesForCountry(countryValue)),
    [countryValue]
  );
  const ranked = useMemo(
    () => rankedLanguagesForCountry(countryValue),
    [countryValue]
  );
  const suggested = ranked.filter((item) => preferredSet.has(item.code));
  const others = ranked.filter((item) => !preferredSet.has(item.code));
  const current = APP_LANGUAGES.find((item) => item.code === language);

  const pick = (code: LanguageCode) => {
    setOpen(false);
    requestLanguageChange(code);
  };

  const countryName = countryValue
    ? countryLabel(getCountryByFirestoreValue(countryValue)?.firestoreValue ?? countryValue)
    : "";

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`rounded-xl border border-white/10 bg-[#111827] text-white transition hover:border-[#FBB03B]/40 ${
          compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current?.nativeName ?? t("language.title")}
      </button>

      {open && (
        <div className="absolute right-0 z-[60] mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-2xl">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-bold text-white">
            {t("language.title")}
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {countryValue ? (
              <>
                <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {t("language.suggested", { country: countryName })}
                </p>
                {suggested.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => pick(item.code)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                      item.code === language
                        ? "bg-[#FBB03B]/15 text-[#FBB03B]"
                        : "text-white hover:bg-white/5"
                    }`}
                  >
                    <span>
                      <span className="block font-medium">{item.nativeName}</span>
                      <span className="text-xs text-gray-500">{item.englishName}</span>
                    </span>
                    {item.code === language ? <span>✓</span> : null}
                  </button>
                ))}
                <p className="mt-2 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {t("language.all")}
                </p>
                {others.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => pick(item.code)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                      item.code === language
                        ? "bg-[#FBB03B]/15 text-[#FBB03B]"
                        : "text-white hover:bg-white/5"
                    }`}
                  >
                    <span>
                      <span className="block font-medium">{item.nativeName}</span>
                      <span className="text-xs text-gray-500">{item.englishName}</span>
                    </span>
                    {item.code === language ? <span>✓</span> : null}
                  </button>
                ))}
              </>
            ) : (
              ranked.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => pick(item.code)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                    item.code === language
                      ? "bg-[#FBB03B]/15 text-[#FBB03B]"
                      : "text-white hover:bg-white/5"
                  }`}
                >
                  <span>
                    <span className="block font-medium">{item.nativeName}</span>
                    <span className="text-xs text-gray-500">{item.englishName}</span>
                  </span>
                  {item.code === language ? <span>✓</span> : null}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
