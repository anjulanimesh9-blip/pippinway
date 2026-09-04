"use client";

import { useI18n } from "@/lib/i18n";

type DeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onDelete: () => Promise<void> | void;
};

export default function DeleteModal({
  open,
  onClose,
  onDelete,
}: DeleteModalProps) {
  const { t } = useI18n();
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-[30px] p-6 w-full max-w-sm text-center shadow-2xl">
        <h2 className="text-2xl font-bold text-white">
          {t("listing.deleteListing")}
        </h2>

        <p className="text-gray-400 mt-3">
          {t("listing.deleteConfirm")}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-[18px] transition"
          >
            {t("common.cancel")}
          </button>

          <button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-500 text-white py-3 rounded-[18px] transition"
          >
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}