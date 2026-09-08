"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGuestAuthPrompt } from "@/app/components/GuestAuthPrompt";
import useAuth from "@/app/hooks/useAuth";
import { trackVibe } from "@/lib/analytics";
import {
  blockVibeUser,
  ensureVibeProfile,
  getVibeProfile,
  isFollowing,
  toggleFollow,
  updateVibeBio,
} from "@/lib/vibe/client";
import { VIBE_BIO_MAX, VIBE_PATHS } from "@/lib/vibe/constants";
import type { VibeProfile } from "@/lib/vibe/types";
import VibeFeed from "../../components/VibeFeed";
import VibeShell from "../../components/VibeShell";

export default function VibeProfileClient({ uid }: { uid: string }) {
  const { user } = useAuth();
  const { requireAuth } = useGuestAuthPrompt();
  const [profile, setProfile] = useState<VibeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const mine = user?.uid === uid;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (user?.uid === uid) {
        const ensured = await ensureVibeProfile(user);
        if (!cancelled) {
          setProfile(ensured);
          setBioDraft(ensured.bio);
        }
      } else {
        const data = await getVibeProfile(uid);
        if (!cancelled) setProfile(data);
      }
      if (user && user.uid !== uid) {
        setFollowing(await isFollowing(user.uid, uid));
      }
      if (!cancelled) setLoading(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [uid, user]);

  const onFollow = async () => {
    if (!user) {
      requireAuth(VIBE_PATHS.profile(uid));
      return;
    }
    try {
      const next = await toggleFollow(uid, following);
      setFollowing(next);
      setProfile((prev) =>
        prev
          ? { ...prev, followerCount: Math.max(0, prev.followerCount + (next ? 1 : -1)) }
          : prev
      );
      trackVibe(next ? "vibe_follow" : "vibe_unfollow");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update follow.");
    }
  };

  return (
    <VibeShell>
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        <Link href={VIBE_PATHS.home} className="text-sm text-[#FBB03B]">
          ← Back to Vibe
        </Link>
        {loading ? (
          <div className="animate-pulse rounded-2xl border border-white/10 bg-[#0F172A] p-10" />
        ) : !profile ? (
          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-8 text-center">
            <p className="font-semibold">This creator has not joined Vibe yet</p>
            <p className="mt-2 text-sm text-gray-400">
              Profiles appear after someone posts or opens Vibe while signed in.
            </p>
          </div>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-[#0F172A] p-5">
            <div className="flex items-start gap-4">
              {profile.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoURL}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-800 text-xl font-bold">
                  {profile.displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold">{profile.displayName}</h1>
                <p className="mt-1 text-sm text-gray-400">
                  {profile.followerCount} followers · {profile.followingCount} following ·{" "}
                  {profile.postCount} posts
                </p>
                {editing ? (
                  <div className="mt-3">
                    <textarea
                      value={bioDraft}
                      onChange={(event) => setBioDraft(event.target.value.slice(0, VIBE_BIO_MAX))}
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-[#020817] px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      className="mt-2 rounded-full bg-[#FBB03B] px-3 py-1.5 text-sm font-semibold text-[#0B1220]"
                      onClick={async () => {
                        const bio = await updateVibeBio(uid, bioDraft);
                        setProfile((prev) => (prev ? { ...prev, bio } : prev));
                        setEditing(false);
                      }}
                    >
                      Save bio
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-300">
                    {profile.bio || "No bio yet."}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {mine ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm"
                >
                  Edit bio
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onFollow}
                    className="rounded-full bg-[#FBB03B] px-4 py-2 text-sm font-semibold text-[#0B1220]"
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300"
                    onClick={async () => {
                      if (!user) {
                        requireAuth(VIBE_PATHS.profile(uid));
                        return;
                      }
                      await blockVibeUser(uid);
                      setMessage("Blocked. Their posts will be hidden from your feed.");
                    }}
                  >
                    Block
                  </button>
                </>
              )}
            </div>
            {message ? <p className="mt-2 text-xs text-gray-400">{message}</p> : null}
          </section>
        )}
        <VibeFeed authorId={uid} />
      </div>
    </VibeShell>
  );
}
