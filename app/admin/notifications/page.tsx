"use client";

import { useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { db, storage } from "../../firebase";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");

  const [sendToAll, setSendToAll] = useState(true);
  const [email, setEmail] = useState("");

  const [sending, setSending] = useState(false);

  const [image, setImage] = useState<File | null>(null);

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Please enter a title and message.");
      return;
    }

    setSending(true);

    try {
      let imageUrl = "";

      if (image) {
        const imageRef = ref(
          storage,
          `notifications/${Date.now()}-${image.name}`
        );

        await uploadBytes(imageRef, image);

        imageUrl = await getDownloadURL(imageRef);
      }

      if (sendToAll) {
        const usersSnap = await getDocs(
          collection(db, "users")
        );

        const promises = usersSnap.docs
          .map((userDoc) => {
            const data = userDoc.data();

            if (!data.email) return null;

            return addDoc(
              collection(db, "notifications"),
              {
                userEmail: data.email,
                title,
                message,
                type,
                imageUrl,
                isRead: false,
                createdAt: serverTimestamp(),
              }
            );
          })
          .filter(Boolean);

        await Promise.all(
          promises as Promise<unknown>[]
        );

        alert("Notification sent to all users.");
      } else {
        if (!email.trim()) {
          alert("Please enter user email.");
          setSending(false);
          return;
        }

        await addDoc(
          collection(db, "notifications"),
          {
            userEmail: email,
            title,
            message,
            type,
            imageUrl,
            isRead: false,
            createdAt: serverTimestamp(),
          }
        );

        alert("Notification sent.");
      }

      setTitle("");
      setMessage("");
      setEmail("");
      setImage(null);

          } catch (error) {
      console.error(error);
      alert("Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 text-white sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          🔔 Send Notifications
        </h1>

        <div className="bg-[#111827] rounded-3xl border border-gray-800 p-8">

          <label className="block mb-2 font-semibold">
            Notification Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title..."
            className="w-full rounded-xl bg-[#1F2937] p-4 outline-none mb-6"
          />

          <label className="block mb-2 font-semibold">
            Upload Image (Optional)
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.length) {
                setImage(e.target.files[0]);
              }
            }}
            className="w-full rounded-xl bg-[#1F2937] p-3 mb-4"
          />

          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-full h-64 object-cover rounded-2xl mb-6"
            />
          )}

          <label className="block mb-2 font-semibold">
            Message
          </label>

          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your notification..."
            className="w-full rounded-xl bg-[#1F2937] p-4 outline-none mb-6"
          />

          <label className="block mb-2 font-semibold">
            Notification Type
          </label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl bg-[#1F2937] p-4 mb-6"
          >
            <option value="announcement">📢 Announcement</option>
            <option value="promotion">🎁 Promotion</option>
            <option value="discount">💰 Discount</option>
            <option value="alert">⚠️ Alert</option>
            <option value="news">📰 News</option>
          </select>

          <div className="space-y-3 mb-6">

            <label className="flex items-center gap-3">
              <input
                type="radio"
                checked={sendToAll}
                onChange={() => setSendToAll(true)}
              />
              Send to All Users
            </label>

            <label className="flex items-center gap-3">
              <input
                type="radio"
                checked={!sendToAll}
                onChange={() => setSendToAll(false)}
              />
              Send to Single User
            </label>

          </div>

          {!sendToAll && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email..."
              className="w-full rounded-xl bg-[#1F2937] p-4 mb-6 outline-none"
            />
          )}
                    <div className="mt-8 rounded-3xl border border-gray-700 bg-[#0F172A] p-6">
            <h2 className="text-2xl font-bold mb-4">
              👀 Live Preview
            </h2>

            <div className="rounded-2xl bg-[#111827] overflow-hidden border border-gray-700">

              {image && (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="w-full h-72 object-cover"
                />
              )}

              <div className="p-6">

                <span className="inline-block rounded-full bg-blue-600 px-3 py-1 text-sm mb-4">
                  {type.toUpperCase()}
                </span>

                <h3 className="text-2xl font-bold mb-3">
                  {title || "Notification Title"}
                </h3>

                <p className="text-gray-300 whitespace-pre-wrap">
                  {message || "Your notification message will appear here..."}
                </p>

              </div>

            </div>
          </div>

          <button
            onClick={sendNotification}
            disabled={sending}
            className="mt-8 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 transition p-4 text-xl font-bold disabled:opacity-50"
          >
            {sending ? "Sending..." : "🚀 Send Notification"}
          </button>

        </div>
      </div>
    </div>
  );
}