"use client";

import {
  useState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  addDoc,
  collection,
  getDoc,
  updateDoc,
  increment,
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
} from "firebase/auth";

export default function AddListing() {
  const router =
    useRouter();

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
    const [adType,
  setAdType] =
  useState("free");

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

        if (
          userSnap.exists()
        ) {
          const userData =
            userSnap.data();

          setCountry(
            userData.country ||
              ""
          );

          setPhone(
            userData.phone ||
              ""
          );
        }
      }
    );

  return () =>
    unsubscribe();
}, []);
  const handleSubmit =
    async (
      e: any
    ) => {
      e.preventDefault();

      const newErrors: any =
        {};

      if (!title)
        newErrors.title =
          true;

      if (!price)
        newErrors.price =
          true;

      if (!country)
        newErrors.country =
          true;

      if (!location)
        newErrors.location =
          true;

      if (!phone)
        newErrors.phone =
          true;

      if (!category)
        newErrors.category =
          true;

      if (!description)
        newErrors.description =
          true;

      if (
        images.length !==
        4
      ) {
        newErrors.image =
          true;

        alert(
          "Please upload exactly 4 photos"
        );
      }

      setErrors(
        newErrors
      );

      if (
        Object.keys(
          newErrors
        ).length > 0
      ) {
        return;
      }
      setLoading(true);

try {
  let imageUrls:
    string[] = [];

  for (
    const image of images
  ) {
    const imageRef =
      ref(
        storage,
        `listings/${Date.now()}-${image.name}`
      );

    await uploadBytes(
      imageRef,
      image
    );

    const downloadURL =
      await getDownloadURL(
        imageRef
      );

    imageUrls.push(
      downloadURL
    );
  }
const user = auth.currentUser;

if (!user) {
  alert("Please login first");
  return;
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

if (
  userData
    ?.adsPostedThisMonth >=
  userData
    ?.monthlyAdLimit
) {
  alert(
    "You've reached your monthly limit.\nUpgrade to Seller Pro ⭐"
  );

  return;
}
  await addDoc(
    collection(
      db,
      "listings"
    ),
    {
      title,
      price,
      country,
      location,
      category,
      phone,
      description,
      imageUrls,
      imageUrl:
        imageUrls[0],
      ownerEmail:
        auth
          .currentUser
          ?.email,
      createdAt:
        new Date(),
        featured:
  adType ===
  "featured",
  

adType,
    }
  );
  await updateDoc(
  userRef,
  {
    adsPostedThisMonth:
      increment(1),
  }
);
  router.push(
    "/profile"
  );

} catch (error) {
  console.log(
    error
  );

  setLoading(
    false
  );

  alert(
    "Upload failed"
  );
}
    };

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <div className="max-w-3xl mx-auto bg-gradient-to-b from-[#0f172a] to-[#111827] border border-white/10 rounded-[40px] shadow-[0_0_50px_rgba(59,130,246,0.08)] p-6 md:p-10">

        <button
          onClick={() =>
            router.push("/")
          }
          className="mb-6 border border-gray-700 px-4 py-2 rounded-2xl"
        >
          ← Back to Home
        </button>

        <h1 className="text-3xl font-bold mb-6">
          Add Listing
        </h1>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(
              e
            ) =>
              setTitle(
                e.target
                  .value
              )
            }
            className="w-full bg-[#0b1120] border border-blue-900/30 focus:border-blue-500 outline-none text-white p-4 rounded-[24px] mb-4 transition"
          />

          <input
            type="text"
            placeholder="Price"
            value={price}
            onChange={(
              e
            ) =>
              setPrice(
                e.target
                  .value
              )
            }
            className="w-full bg-[#0b1120] border border-blue-900/30 focus:border-blue-500 outline-none text-white p-4 rounded-[24px] mb-4 transition"
          />

         <select
  value={country}
  onChange={(e) =>
    setCountry(
      e.target.value
    )
  }
  className="w-full bg-[#0b1120] border border-blue-900/30 focus:border-blue-500 outline-none text-white p-4 rounded-[24px] mb-4 transition"
>
  <option value="">
    Select Country
  </option>
  <option value="Singapore">
    Singapore
  </option>
  <option value="India">
    India
  </option>
  <option value="Thailand">
    Thailand
  </option>
  <option value="Zimbabwe">
    Zimbabwe
  </option>
  <option value="USA">
    USA
  </option>
  <option value="Maldives">
    Maldives
  </option>
  <option value="Sri Lanka">
    Sri Lanka
  </option>
  <option value="South Africa">
    South Africa
  </option>
  <option value="United Kingdom">
    United Kingdom
  </option>
  <option value="Canada">
    Canada
  </option>
</select>
           
          <input
            type="text"
            placeholder="City / Location"
            value={
              location
            }
            onChange={(
              e
            ) =>
              setLocation(
                e.target
                  .value
              )
            }
            className="w-full bg-[#0b1120] border border-blue-900/30 focus:border-blue-500 outline-none text-white p-4 rounded-[24px] mb-4 transition"
          />

          <input
            type="text"
            placeholder="WhatsApp Number"
            value={phone}
            onChange={(
              e
            ) =>
              setPhone(
                e.target
                  .value
              )
            }
            className="w-full bg-[#0b1120] border border-blue-900/30 focus:border-blue-500 outline-none text-white p-4 rounded-[24px] mb-4 transition"
          />

          <select
  value={category}
  onChange={(e) =>
    setCategory(
      e.target.value
    )
  }
  className="w-full bg-[#0b1120] border border-blue-900/30 focus:border-blue-500 outline-none text-white p-4 rounded-[24px] mb-4 transition"
>
  <option value="">
    Select Category
  </option>

  <option value="Cars">
    🚗 Cars
  </option>

  <option value="Motorbikes">
    🏍️ Motorbikes
  </option>

  <option value="Property">
    🏠 Property
  </option>

  <option value="Electronics">
    📱 Electronics
  </option>

  <option value="Fashion">
    👕 Fashion
  </option>

  <option value="Jobs">
    💼 Jobs
  </option>

  <option value="Services">
    🛠️ Services
  </option>

  <option value="Animals">
    🐶 Animals
  </option>

  <option value="Furniture">
    🛋️ Furniture
  </option>

  <option value="Education">
    📚 Education
  </option>

  <option value="Other">
    📦 Other
  </option>
</select>

          <textarea
            placeholder="Description"
            value={
              description
            }
            onChange={(
              e
            ) =>
              setDescription(
                e.target
                  .value
              )
            }
            className="w-full bg-[#0b1120] border border-blue-900/30 focus:border-blue-500 outline-none text-white p-4 rounded-[24px] mb-4 h-36 transition"
          />
          <div className="mb-5">
  <label className="block text-lg font-bold mb-3">
    Select Ad Type
  </label>

  <div className="grid md:grid-cols-2 gap-4">

    {/* Free Ad */}
    <div
      onClick={() =>
        setAdType(
          "free"
        )
      }
className={`cursor-pointer border rounded-[24px] p-5 transition hover:border-blue-400 hover:bg-blue-500/5 ${
  adType === "free"
    ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
    : "border-gray-700 bg-[#0b1120]"
}`}
    >
      <h3 className="font-bold text-xl">
        Free Ad
      </h3>

      <p className="text-gray-400 mt-2">
        Standard listing
      </p>
    </div>

    {/* Featured */}
    <div
      onClick={() =>
        setAdType(
          "featured"
        )
      }
      className={`cursor-pointer border rounded-[24px] p-5 transition relative overflow-hidden ${
  adType === "featured"
    ? "border-yellow-500 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 shadow-[0_0_30px_rgba(234,179,8,0.25)] scale-[1.03]"
    : "border-gray-700 bg-[#0b1120]"
}`}
    >
  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
  👑 BEST
</div>
      <h3 className="font-bold text-2xl text-yellow-400">
  ⭐ Featured Ad
</h3>

      <p className="text-gray-400 mt-2">
        Show at top of
        homepage
      </p>

     <p className="text-green-400 font-bold mt-4 text-lg">
  $1 / 7 Days
</p>
    </div>
  </div>
</div>

        <div className="space-y-3 mb-5">
  {[1, 2, 3, 4].map(
    (num, index) => (
      <div
        key={num}
        className="bg-[#0b1120] border border-blue-900/30 rounded-[24px] p-5"
      >
        <label className="block text-sm text-gray-300 mb-2">
          Photo {num}
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (
              !e.target
                .files?.[0]
            )
              return;

            const newImages =
              [...images];

            newImages[
              index
            ] =
              e.target
                .files[0];

            setImages(
              newImages
            );
          }}
          className="w-full text-sm"
        />

        {images[index] && (
          <p className="text-green-400 text-xs mt-2">
            ✅{" "}
            {
              images[
                index
              ].name
            }
          </p>
        )}
      </div>
    )
  )}
</div>

          <button
  type="submit"
  disabled={loading}
  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] transition text-white font-bold py-4 rounded-[24px] text-lg shadow-lg disabled:opacity-60"
>
  {loading
    ? "Uploading..."
    : "Post Listing"}
</button>
        </form>
      </div>
    </div>
  );
}
