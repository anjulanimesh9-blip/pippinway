"use client";

import { Camera } from "lucide-react";

interface ProfileImageProps {
  profileImage: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileImage({
  profileImage,
  onImageChange,
}: ProfileImageProps) {
  return (
    <div className="bg-[#0F172A] rounded-xl border border-slate-700 p-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        Profile Photo
      </h2>

      <div className="flex flex-col items-center">
        <div className="relative group">
          {profileImage ? (
            <img
  src={
    profileImage ||
    "https://placehold.co/200x200?text=Profile"
  }
  alt="Profile"
  className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-lg"
/>
          ) : (
            <div className="w-36 h-36 rounded-full border-4 border-blue-500 bg-slate-700 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              ?
            </div>
          )}

          <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 rounded-full p-3 cursor-pointer transition">
            <Camera size={18} className="text-white" />

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageChange}
            />
          </label>
        </div>

        <p className="text-gray-400 text-sm mt-4">
          JPG, PNG or WEBP • Max 5MB
        </p>

        <label className="mt-4 cursor-pointer bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-white font-medium transition">
          Change Photo

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
          />
        </label>
      </div>
    </div>
  );
}