"use client";

import { useState } from "react";
import Link from "next/link";
import { Megaphone, Pencil } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

type Score = {
  overall: number;
  label: string;
  profileStrength: number;
  listingHealth: number;
  responseRate: number;
  trust: number;
};

type ProfileRightPanelProps = {
  userId?: string;
  about?: string;
  score: Score;
  onAboutSaved?: (about: string) => void;
};

function ScoreRing({ value, label }: { value: number; label: string }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="10"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-white">{value}%</span>
        <span className="text-xs font-semibold text-emerald-400">{label}</span>
      </div>
    </div>
  );
}

export default function ProfileRightPanel({
  userId,
  about,
  score,
  onAboutSaved,
}: ProfileRightPanelProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(about || "");
  const [saving, setSaving] = useState(false);

  const aboutText =
    about?.trim() ||
    "Welcome to my Pippinway shop. Browse my listings and message me if you have any questions.";

  const saveAbout = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", userId), { about: draft });
      onAboutSaved?.(draft);
      setEditing(false);
    } catch (error) {
      console.error(error);
      alert("Could not save your About Me text.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-[#FBB03B]/30 bg-gradient-to-b from-[#2a2110] to-[#151A22] p-5 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FBB03B]/15 text-[#FBB03B]">
          <Megaphone size={26} />
        </div>
        <p className="text-lg font-extrabold leading-tight text-white">
          SELL FASTER
          <br />
          GET FEATURED!
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Put your ads at the top and reach more buyers today.
        </p>
        <Link
          href="/featured-packages"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#FBB03B] py-2.5 text-sm font-bold text-black hover:bg-[#ffc14d]"
        >
          Get Featured
        </Link>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#151A22] p-5">
        <h3 className="mb-3 text-sm font-bold text-white">Seller Performance</h3>
        <ScoreRing value={score.overall} label={score.label} />
        <p className="mt-1 text-center text-xs text-gray-400">{score.label} seller score</p>

        <div className="mt-4 space-y-2 text-sm">
          <Row label="Response Rate" value={`${score.responseRate}%`} />
          <Row label="Listing Health" value={`${score.listingHealth}%`} />
          <Row label="Profile Strength" value={`${score.profileStrength}%`} />
          <Row label="Buyer Trust" value={`${score.trust}%`} />
        </div>
      </div>

      <div id="profile-about" className="rounded-2xl border border-white/8 bg-[#151A22] p-5">
        <h3 className="mb-3 text-sm font-bold text-white">About Me</h3>
        {editing ? (
          <div className="space-y-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-[#0B0E14] p-3 text-sm text-white outline-none"
              placeholder="Tell buyers about yourself..."
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveAbout}
                disabled={saving}
                className="flex-1 rounded-xl bg-[#FBB03B] py-2 text-sm font-bold text-black disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(about || "");
                  setEditing(false);
                }}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm leading-6 text-gray-400">{aboutText}</p>
            <button
              type="button"
              onClick={() => {
                setDraft(about || "");
                setEditing(true);
              }}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
            >
              <Pencil size={14} />
              Edit About Me
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-gray-400">
      <span>{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
