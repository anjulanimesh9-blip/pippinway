"use client";

interface DangerZoneProps {
  onDeleteAccount: () => void;
}

export default function DangerZone({
  onDeleteAccount,
}: DangerZoneProps) {
  return (
    <div className="bg-[#0F172A] border border-red-600 rounded-xl p-6 mt-6">
      <h2 className="text-xl font-semibold text-red-500 mb-3">
        Danger Zone
      </h2>

      <p className="text-gray-300 mb-6">
        Permanently delete your account and all associated data.
        This action cannot be undone.
      </p>

      <button
        onClick={onDeleteAccount}
        className="w-full bg-red-600 hover:bg-red-700 transition-colors py-3 rounded-lg text-white font-semibold"
      >
        Delete Account
      </button>
    </div>
  );
}