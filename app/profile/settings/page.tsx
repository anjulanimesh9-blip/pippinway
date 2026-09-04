"use client";

import LoadingScreen from "./components/LoadingScreen";
import ProfileImage from "./components/ProfileImage";
import ProfileCard from "./components/ProfileCard";
import SecurityCard from "./components/SecurityCard";
import DangerZone from "./components/DangerZone";

import { useSettings } from "./hooks/useSettings";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

export default function SettingsPage() {
  const { t } = useI18n();
  const settings = useSettings();

  if (settings.loading) {
    return <LoadingScreen />;
  }

  if (!settings.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
        {t("settings.pleaseLogin")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-xl border border-slate-700 bg-[#0F172A] p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            {t("settings.language")}
          </h2>
          <LanguageSwitcher />
        </div>

        <ProfileImage
          profileImage={settings.profileImage}
          onImageChange={settings.handleImageChange}
        />

        <ProfileCard
          displayName={settings.displayName}
          setDisplayName={settings.setDisplayName}
          email={settings.user.email ?? ""}
          phone={settings.phone}
          setPhone={settings.setPhone}
          country={settings.country}
          setCountry={settings.setCountry}
          saving={settings.saving}
          onSave={settings.saveProfile}
        />

        <SecurityCard
          newPassword={settings.newPassword}
          setNewPassword={settings.setNewPassword}
          onChangePassword={settings.changePassword}
        />

        <DangerZone
          onDeleteAccount={settings.deleteAccount}
        />
      </div>
    </div>
  );
}