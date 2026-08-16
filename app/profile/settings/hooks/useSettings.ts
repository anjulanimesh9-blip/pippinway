"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { auth, db, storage } from "../../../firebase";

import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  updatePassword,
  deleteUser,
  onAuthStateChanged,
  User,
} from "firebase/auth";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export function useSettings() {

const [user, setUser] = useState<User | null>(null);
const [previewImage, setPreviewImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [profileImage, setProfileImage] = useState("");

  // Upload
  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  // Security
  const [newPassword, setNewPassword] =
    useState("");
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    setUser(firebaseUser);

    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    try {
      const snap = await getDoc(doc(db, "users", firebaseUser.uid));

      if (snap.exists()) {
        const data = snap.data();

        setDisplayName(data.displayName || "");
        setPhone(data.phone || "");
        setCountry(data.country || "");
        setProfileImage(data.profileImage || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, []);   

const handleImageChange = (
  e: ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files?.length) return;

  const file = e.target.files[0];

  setSelectedImage(file);

  setPreviewImage(URL.createObjectURL(file));
};

    const saveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);

      let imageUrl = profileImage;

      // Upload new profile photo if selected
      if (selectedImage) {
        const imageRef = ref(
          storage,
          `profile-images/${user.uid}`
        );

        await uploadBytes(imageRef, selectedImage);

        imageUrl = await getDownloadURL(imageRef);
      }

      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        phone,
        country,
        profileImage: imageUrl,
      });

      setProfileImage(imageUrl);

      alert("✅ Profile updated successfully.");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!user) return;

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      await updatePassword(user, newPassword);

      setNewPassword("");

      alert("✅ Password updated successfully.");
    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/requires-recent-login") {
        alert(
          "For security reasons, please log out and log in again before changing your password."
        );
      } else {
        alert("❌ Failed to update password.");
      }
    }
  };
    const deleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account?\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    try {
      // Delete Firestore document
      await deleteDoc(doc(db, "users", user.uid));

      // Delete Firebase Authentication account
      await deleteUser(user);

      alert("✅ Your account has been deleted.");

      window.location.href = "/";
    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/requires-recent-login") {
        alert(
          "Please log out and log in again before deleting your account."
        );
      } else {
        alert("❌ Failed to delete account.");
      }
    }
  };

  return {
    user,
    loading,
    saving,

    displayName,
    setDisplayName,

    phone,
    setPhone,

    country,
    setCountry,

    profileImage: previewImage || profileImage,
setProfileImage,

    selectedImage,

    newPassword,
    setNewPassword,

    handleImageChange,
    saveProfile,
    changePassword,
    deleteAccount,
  };
}