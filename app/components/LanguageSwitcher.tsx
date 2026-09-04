"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  quiet?: boolean;
  variant?: "pill" | "row";
  className?: string;
};

export default function LanguageSwitcher({
  compact = false,
  quiet = false,
  variant = "pill",
  className = "",
}: LanguageSwitcherProps) {
  const { language, t, countryLabel, applyLanguage } = useI18n();
  const { market } = useCountryNavigation();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
  const codeLabel = (current?.code ?? "en").toUpperCase();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        const sheet = document.getElementById("pw-language-sheet");
        if (sheet && sheet.contains(event.target as Node)) return;
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    const lockBody = window.matchMedia("(max-width: 767px)").matches;
    const previousOverflow = document.body.style.overflow;
    if (lockBody) document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      if (lockBody) document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const pick = (code: LanguageCode) => {
    setOpen(false);
    if (code !== language) applyLanguage(code);
  };

  const countryName = countryValue
    ? countryLabel(
        getCountryByFirestoreValue(countryValue)?.firestoreValue ?? countryValue
      )
    : "";

  const renderList = (onPick: (code: LanguageCode) => void) => (
    <div className="max-h-[min(70vh,28rem)] overflow-y-auto p-2">
      {countryValue ? (
        <>
          <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {t("language.suggested", { country: countryName })}
          </p>
          {suggested.map((item) => (
            <LanguageRow
              key={item.code}
              nativeName={item.nativeName}
              englishName={item.englishName}
              active={item.code === language}
              onClick={() => onPick(item.code)}
            />
          ))}
          {others.length > 0 && (
            <p className="mt-2 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {t("language.all")}
            </p>
          )}
          {others.map((item) => (
            <LanguageRow
              key={item.code}
              nativeName={item.nativeName}
              englishName={item.englishName}
              active={item.code === language}
              onClick={() => onPick(item.code)}
            />
          ))}
        </>
      ) : (
        ranked.map((item) => (
          <LanguageRow
            key={item.code}
            nativeName={item.nativeName}
            englishName={item.englishName}
            active={item.code === language}
            onClick={() => onPick(item.code)}
          />
        ))
      )}
    </div>
  );

  const isRow = variant === "row";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={
          isRow
            ? "flex h-12 w-full items-center justify-between rounded-xl px-3 text-left text-[15px] text-white transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
            : compact
              ? "inline-flex h-10 min-w-10 shrink-0 items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-semibold text-white transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
              : quiet
                ? "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
                : "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/12 bg-[#111827] px-2.5 text-sm font-medium text-white transition hover:border-[#FBB03B]/45 hover:bg-[#151c2e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FBB03B]"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t("language.title")}
      >
        {isRow ? (
          <>
            <span className="flex items-center gap-2.5">
              <span aria-hidden>🌐</span>
              <span>{t("language.title")}</span>
            </span>
            <span className="text-sm text-gray-400">
              {current?.nativeName ?? codeLabel}
            </span>
          </>
        ) : (
          <>
            <span aria-hidden>🌐</span>
            <span>{compact ? codeLabel : current?.nativeName ?? t("language.title")}</span>
          </>
        )}
      </button>

      {open && !isRow && (
        <div className="absolute right-0 z-[70] mt-2 hidden w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-2xl md:block">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-bold text-white">
            {t("language.title")}
          </div>
          {renderList(pick)}
        </div>
      )}

      {open &&
        mounted &&
        createPortal(
          <div className={isRow ? "" : "md:hidden"}>
            <button
              type="button"
              className="fixed inset-0 z-[90] bg-black/65"
              aria-label={t("common.close")}
              onClick={() => setOpen(false)}
            />
            <div
              id="pw-language-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pw-language-sheet-title"
              className="fixed inset-x-0 bottom-0 z-[100] max-h-[80vh] overflow-hidden rounded-t-3xl border border-white/10 bg-[#0F172A] pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h2
                  id="pw-language-sheet-title"
                  className="text-base font-bold text-white"
                >
                  {t("language.title")}
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  {t("common.close")}
                </button>
              </div>
              {renderList(pick)}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

function LanguageRow({
  nativeName,
  englishName,
  active,
  onClick,
}: {
  nativeName: string;
  englishName: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${
        active
          ? "bg-[#FBB03B]/15 text-[#FBB03B]"
          : "text-white hover:bg-white/5"
      }`}
    >
      <span>
        <span className="block font-medium">{nativeName}</span>
        {nativeName !== englishName && (
          <span className="text-xs text-gray-500">{englishName}</span>
        )}
      </span>
      {active ? <span aria-hidden>✓</span> : null}
    </button>
  );
}
