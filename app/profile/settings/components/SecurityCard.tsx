"use client";

import { useI18n } from "@/lib/i18n";

interface SecurityCardProps {
  newPassword: string;
  setNewPassword: (value: string) => void;
  onChangePassword: () => void;
}

export default function SecurityCard({
  newPassword,
  setNewPassword,
  onChangePassword,
}: SecurityCardProps) {
  const { t } = useI18n();
  return (
    <div className="bg-[#0F172A] border border-slate-700 rounded-xl p-6 mt-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        {t("settings.security")}
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-gray-300 mb-2">
            {t("settings.newPassword")}
          </label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t("settings.newPasswordPlaceholder")}
            className="w-full rounded-lg bg-[#1E293B] border border-slate-600 p-3 text-white"
          />
        </div>

        <button
          onClick={onChangePassword}
          className="w-full bg-green-600 hover:bg-green-700 rounded-lg py-3 text-white font-semibold"
        >
          {t("settings.changePassword")}
        </button>
      </div>
    </div>
  );
}