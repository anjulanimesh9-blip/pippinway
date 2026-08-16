"use client";

import { useEffect, useState } from "react";
import {
  updateProfile,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/app/firebase";

export function useSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState(auth.currentUser);

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const snap = await getDoc(
          doc(db, "users", currentUser.uid)
        );

        if (snap.exists()) {
          const data = snap.data();

          setDisplayName(data.displayName || "");
          setPhone(data.phone || "");
          setCountry(data.country || "");
          setProfileImage(data.profileImage || "");
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);

    try {
      await updateProfile(user, {
        displayName,
      });

      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        phone,
        country,
        profileImage,
      });

      alert("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }

    setSaving(false);
  };

  const changePassword = async () => {
    if (!user || !newPassword) return;

    try {
      await updatePassword(user, newPassword);
      setNewPassword("");
      alert("Password changed successfully.");
    } catch (err) {
      console.error(err);
      alert("Unable to change password. Please login again.");
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    const ok = window.confirm(
      "Are you sure you want to delete your account?"
    );

    if (!ok) return;

    try {
      await deleteUser(user);
      alert("Account deleted.");
    } catch (err) {
      console.error(err);
      alert("Unable to delete account. Please login again.");
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setProfileImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  return {
    loading,
    saving,

    user,

    displayName,
    setDisplayName,

    phone,
    setPhone,

    country,
    setCountry,

    profileImage,
    handleImageChange,

    newPassword,
    setNewPassword,

    saveProfile,
    changePassword,
    deleteAccount,
  };
}