"use client";

import { countries } from "../../data/countries";
import { useI18n } from "@/lib/i18n";

interface ProfileCardProps {
  displayName: string;
  setDisplayName: (value: string) => void;
  email: string;
  phone: string;
  setPhone: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  saving: boolean;
  onSave: () => void;
}

export default function ProfileCard({
  displayName,
  setDisplayName,
  email,
  phone,
  setPhone,
  country,
  setCountry,
  saving,
  onSave,
}: ProfileCardProps) {
  const { t, countryLabel } = useI18n();
  return (
    <div className="bg-[#0F172A] border border-slate-700 rounded-xl p-6 mt-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        {t("settings.profileInfo")}
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-gray-300 mb-2">
            {t("settings.displayName")}
          </label>

          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg bg-[#1E293B] border border-slate-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("settings.displayNamePlaceholder")}
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">
            {t("auth.email")}
          </label>

          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg bg-[#111827] border border-slate-700 p-3 text-gray-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">
            {t("settings.phoneNumber")}
          </label>

          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg bg-[#1E293B] border border-slate-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("settings.phoneNumber")}
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">
            {t("auth.country")}
          </label>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-lg bg-[#1E293B] border border-slate-600 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t("post.selectCountry")}</option>

            {countries.map((item) => (
              <option key={item} value={item}>
                {countryLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg py-3 text-white font-semibold transition-colors"
        >
          {saving ? t("settings.saving") : t("settings.saveChanges")}
        </button>
      </div>
    </div>
  );
}