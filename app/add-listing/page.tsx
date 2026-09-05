"use client";

import {
  Suspense,
  useState,
  useEffect,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { COUNTRY_STORAGE_KEY, countryMarketplacePath } from "@/lib/countries";
import { canonicalCategory, canonicalCountry } from "@/lib/filterListings";
import {
  doc,
  addDoc,
  collection,
  getDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  db,
  auth,
  storage,
} from "../firebase";
import {
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  MAX_LISTING_IMAGES,
  MAX_LISTING_IMAGES_MESSAGE,
  LISTING_TITLE_MAX,
  LISTING_DESCRIPTION_MAX,
  LISTING_LOCATION_MAX,
  LISTING_PHONE_MAX,
  isAllowedListingImage,
} from "@/lib/listingImages";
import { compressListingImage } from "@/lib/compressImage";
import { applyCountryCallingCode } from "@/lib/countryCallingCodes";
import { trackPostAd } from "@/lib/analytics";
import { parseListingPrice } from "@/lib/formatPrice";
import { MARKET_COUNTRIES } from "@/lib/countries";
import { useI18n } from "@/lib/i18n";

const POST_CATEGORIES = [
  { value: "Cars", icon: "🚗" },
  { value: "Motorbikes", icon: "🏍️" },
  { value: "Property", icon: "🏠" },
  { value: "Electronics", icon: "📱" },
  { value: "Fashion", icon: "👕" },
  { value: "Jobs", icon: "💼" },
  { value: "Services", icon: "🛠️" },
  { value: "Animals", icon: "🐶" },
  { value: "Furniture", icon: "🛋️" },
  { value: "Education", icon: "📚" },
  { value: "Other", icon: "📦" },
];

export default function AddListingPage() {
  const { t } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
          {t("common.loading")}
        </div>
      }
    >
      <AddListing />
    </Suspense>
  );
}

function AddListing() {
  const { t, categoryLabel, countryLabel } = useI18n();
  const router =
    useRouter();
  const searchParams = useSearchParams();

const [checkingAuth, setCheckingAuth] =
  useState(true);

  const [title, setTitle] =
    useState("");
  const [price, setPrice] =
    useState("");
  const [country, setCountry] =
    useState("");
  const [location, setLocation] =
    useState("");
  const [phone, setPhone] =
    useState("");
  const [category, setCategory] =
    useState("");
  const [
    description,
    setDescription,
  ] = useState("");

  const [images, setImages] =
    useState<File[]>(
      []
    );
    const [loading, setLoading] =
  useState(false);

  const [errors, setErrors] =
    useState<any>({});
  const [previewImage, setPreviewImage] =
  useState<string | null>(null);
  useEffect(() => {
  const unsubscribe =
    onAuthStateChanged(
      auth,
      (currentUser) => {
  if (!currentUser) {
    const country = searchParams.get("country");
    const returnUrl = country
      ? `/add-listing?country=${encodeURIComponent(country)}`
      : "/add-listing";
    router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    return;
  }

  setCheckingAuth(false);
}
    );

  return () => unsubscribe();
}, [router, searchParams]);

    useEffect(() => {
  const unsubscribe =
    onAuthStateChanged(
      auth,
      async (
        user
      ) => {
        if (!user)
          return;

        const userRef =
          doc(
            db,
            "users",
            user.uid
          );

        const userSnap =
          await getDoc(
            userRef
          );

        const fromQuery = canonicalCountry(searchParams.get("country"));
        const stored = canonicalCountry(
          localStorage.getItem(COUNTRY_STORAGE_KEY) ??
            localStorage.getItem("country")
        );

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setPhone(userData.phone || "");
          if (fromQuery) {
            setCountry(fromQuery);
          } else if (userData.country) {
            setCountry(userData.country);
          } else if (stored) {
            setCountry(stored);
          }
        } else if (fromQuery) {
          setCountry(fromQuery);
        } else if (stored) {
          setCountry(stored);
        }
      }
    );

  return () =>
    unsubscribe();
}, [searchParams]);
if (checkingAuth) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      {t("common.loading")}
    </div>
  );
}
  const handleSubmit =
    async (
      e: any
    ) => {
      e.preventDefault();

      const newErrors: any =
        {};

      const countryValue = canonicalCountry(country);
      const categoryValue = canonicalCategory(category);

      if (!title.trim() || title.trim().length > LISTING_TITLE_MAX)
        newErrors.title =
          true;

      if (!price)
        newErrors.price =
          true;

      if (!countryValue)
        newErrors.country =
          true;

      if (!location.trim() || location.trim().length > LISTING_LOCATION_MAX)
        newErrors.location =
          true;

      if (!phone.trim() || phone.trim().length > LISTING_PHONE_MAX)
        newErrors.phone =
          true;

      if (!categoryValue)
        newErrors.category =
          true;

      if (!description.trim() || description.trim().length > LISTING_DESCRIPTION_MAX)
        newErrors.description =
          true;

    const listingImages = images.filter(
      (image): image is File => image instanceof File
    );

    if (
      listingImages.length === 0 ||
      listingImages.length > MAX_LISTING_IMAGES ||
      listingImages.some((image) => !isAllowedListingImage(image))
    ) {
  newErrors.image = true;
}

      setErrors(
        newErrors
      );

      if (
        Object.keys(
          newErrors
        ).length > 0 ||
        !countryValue ||
        !categoryValue
      ) {
        return;
      }

      const user = auth.currentUser;

      if (!user) {
        alert(t("post.loginFirst"));
        return;
      }

      setLoading(true);

try {
  let imageUrls:
    string[] = [];

  for (
    const image of listingImages
  ) {
    const compressed = await compressListingImage(image);
    const imageRef =
      ref(
        storage,
        `listings/${Date.now()}-${compressed.name}`
      );

    await uploadBytes(
      imageRef,
      compressed
    );

    const downloadURL =
      await getDownloadURL(
        imageRef
      );

    imageUrls.push(
      downloadURL
    );
  }

const userRef = doc(
  db,
  "users",
  user.uid
);

const userSnap =
  await getDoc(
    userRef
  );

const userData =
  userSnap.data();

const postedAt = new Date();
const expiresAt = new Date(
  postedAt.getTime() + 30 * 24 * 60 * 60 * 1000
);

const created = await addDoc(
  collection(db, "listings"),
  {
    title: title.trim().slice(0, LISTING_TITLE_MAX),
    price: parseListingPrice(price),
    country: countryValue,
    location: location.trim().slice(0, LISTING_LOCATION_MAX),
    category: categoryValue,
    phone: phone.trim().slice(0, LISTING_PHONE_MAX),
    description: description.trim().slice(0, LISTING_DESCRIPTION_MAX),
    imageUrls: imageUrls.slice(0, MAX_LISTING_IMAGES),
    imageUrl: imageUrls[0],

    ownerId: user.uid,
    ownerEmail: user.email,
    ownerName:
      userData?.displayName ||
      user.displayName ||
      "Private Seller",

    createdAt: postedAt,
    publishedAt: postedAt,

    featured: false,
    approved: true,
    rejected: false,
    expired: false,
    sold: false,
    draft: false,
    status: "active",
    rewardCounted: false,
    adType: "free",

    expiresAt,
    expiryDate: expiresAt,

    imagesCompressed: true,
  }
);

  trackPostAd({
    listing_id: created.id,
    category,
    country,
  });
  alert(t("post.publishedBody"));
  router.push(
    "/profile"
  );

} catch (error) {
  console.error(
    error
  );

  const firebaseError = error as {
    code?: string;
    message?: string;
  };
  const detail = [
    firebaseError?.message,
    firebaseError?.code
      ? `(${firebaseError.code})`
      : "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  alert(
    detail || t("post.uploadFailed")
  );
} finally {
  setLoading(false);
}
    };

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <div className="max-w-3xl mx-auto bg-gradient-to-b from-[#0f172a] to-[#111827] border border-white/10 rounded-[40px] shadow-[0_0_50px_rgba(59,130,246,0.08)] p-6 md:p-10">

        <button
          onClick={() =>
            router.push(countryMarketplacePath(country || searchParams.get("country")))
          }
          className="mb-6 border border-gray-700 px-4 py-2 rounded-2xl"
        >
          ← {t("auth.backHome")}
        </button>

        <h1 className="text-3xl font-bold mb-3">
          {t("post.addListing")}
        </h1>
        <p className="mb-6 text-sm text-gray-400">
          {t("post.hintBefore")}{" "}
          <a href="/posting-rules" className="text-[#FBB03B] hover:underline">
            {t("post.postingRules")}
          </a>{" "}
          {t("post.hintAnd")}{" "}
          <a href="/safety" className="text-[#FBB03B] hover:underline">
            {t("post.safetyGuidance")}
          </a>{" "}
          {t("post.hintAfter")}
        </p>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <input
            type="text"
            placeholder={t("post.title")}
            maxLength={LISTING_TITLE_MAX}
            value={title}
           onChange={(e) => {
  setTitle(e.target.value);

  if (e.target.value.trim()) {
    setErrors((prev: any) => ({
      ...prev,
      title: false,
    }));
  }
}}
           className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-4 transition ${
  errors.title
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
          />

          <input
            type="text"
            placeholder={t("post.price")}
            value={price}
           onChange={(e) => {
  setPrice(e.target.value);

  if (e.target.value.trim()) {
    setErrors((prev: any) => ({
      ...prev,
      price: false,
    }));
  }
}}
            className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-4 transition ${
  errors.price
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
            />

         <select
  value={country}
onChange={(e) => {
  const selectedCountry = e.target.value;

  setCountry(selectedCountry);
  setPhone((prev) =>
    applyCountryCallingCode(prev, selectedCountry)
  );

  setErrors((prev: any) => ({
    ...prev,
    country: false,
  }));

 }}
  className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-4 transition ${
  errors.country
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
>
  <option value="">
    {t("post.selectCountry")}
  </option>
  {MARKET_COUNTRIES.map((item) => (
    <option key={item.firestoreValue} value={item.firestoreValue}>
      {countryLabel(item.firestoreValue)}
    </option>
  ))}
</select>
           
          <input
            type="text"
            placeholder={t("post.location")}
            maxLength={LISTING_LOCATION_MAX}
            value={
              location
            }
          onChange={(e) => {
  setLocation(e.target.value);

  if (e.target.value.trim()) {
    setErrors((prev: any) => ({
      ...prev,
      location: false,
    }));
  }
}}
 className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-4 transition ${
  errors.location
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
            />

       <input
  type="text"
  placeholder={t("post.phonePlaceholder")}
  maxLength={LISTING_PHONE_MAX}
  value={phone}
  onChange={(e) => {
  setPhone(e.target.value);

  if (e.target.value.trim()) {
    setErrors((prev: any) => ({
      ...prev,
      phone: false,
    }));
  }
}}
  className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-1 transition ${
  errors.phone
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
/>

<p className="text-xs text-gray-400 mb-4 ml-2">
  {t("post.phoneExample")}
</p>

          <select
  value={category}
  onChange={(e) => {
  setCategory(e.target.value);

  setErrors((prev: any) => ({
    ...prev,
    category: false,
  }));
}}
  className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-4 transition ${
  errors.category
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
  >
  <option value="">
    {t("post.selectCategory")}
  </option>
  {POST_CATEGORIES.map((item) => (
    <option key={item.value} value={item.value}>
      {item.icon} {categoryLabel(item.value)}
    </option>
  ))}
</select>

          <textarea
            placeholder={t("post.description")}
            maxLength={LISTING_DESCRIPTION_MAX}
            value={
              description
            }
           onChange={(e) => {
  setDescription(e.target.value);

  if (e.target.value.trim()) {
    setErrors((prev: any) => ({
      ...prev,
      description: false,
    }));
  }
}}
        className={`w-full bg-[#0b1120] outline-none text-white p-4 rounded-[24px] mb-4 h-36 transition ${
  errors.description
    ? "border border-red-500"
    : "border border-blue-900/30 focus:border-blue-500"
}`}
          />
<div className="space-y-3 mb-5">
  <p className="text-xs text-gray-400">
    {t("post.maxPhotos", { count: MAX_LISTING_IMAGES })}
  </p>
  {Array.from({ length: MAX_LISTING_IMAGES }, (_, i) => i + 1).map((num, index) => (
    <div
      key={num}
      className={`relative bg-[#0b1120] rounded-[24px] p-5 ${
        errors.image
          ? "border border-red-500"
          : "border border-blue-900/30"
      }`}
    >
      <label className="block text-sm text-gray-300 mb-2">
        {t("post.photoN", { n: num })}
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (!picked) return;

          const filled = images.filter(Boolean).length;
          const replacing = Boolean(images[index]);
          if (!replacing && filled >= MAX_LISTING_IMAGES) {
            e.target.value = "";
            alert(MAX_LISTING_IMAGES_MESSAGE);
            return;
          }

          const newImages = [...images];
          newImages[index] = picked;

          setImages([...newImages]);

          if (
            newImages.filter(Boolean).length > 0 &&
            newImages.filter(Boolean).length <= MAX_LISTING_IMAGES
          ) {
            setErrors((prev: any) => ({
              ...prev,
              image: false,
            }));
          }
        }}
        className="w-full text-sm"
      />

      {images[index] && (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-green-500">

          {index === 0 && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded z-10">
              ⭐ {t("post.coverPhoto")}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              const newImages = [...images];
              newImages[index] = undefined as any;
              setImages([...newImages]);
            }}
            className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full z-10"
          >
            ✕
          </button>

          <img
            src={URL.createObjectURL(images[index])}
            alt={t("post.photoN", { n: num })}
            onClick={() =>
              setPreviewImage(
                URL.createObjectURL(images[index])
              )
            }
            className="w-full h-40 object-cover cursor-pointer"
          />

          <div className="p-2 bg-black/30">
            <p className="text-green-400 text-xs truncate">
              ✅ {images[index].name}
            </p>
          </div>

        </div>
      )}
    </div>
  ))}

  {errors.image && (
    <p className="text-red-500 text-sm mt-2 text-center">
      {t("post.uploadPhotosError", { count: MAX_LISTING_IMAGES })}
    </p>
  )}
</div>

          <button
  type="submit"
  disabled={loading}
  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] transition text-white font-bold py-4 rounded-[24px] text-lg shadow-lg disabled:opacity-60"
>
  {loading
    ? t("post.uploadingSimple")
    : t("post.postListing")}
</button>
{previewImage && (
  <div
    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
    onClick={() => setPreviewImage(null)}
  >
    <img
      src={previewImage}
      alt={t("post.preview")}
      className="max-w-[90%] max-h-[90%] rounded-xl"
    />
  </div>
)}
        </form>
      </div>
    </div>
  );
}
