"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useRouter } from "next/navigation";

export default function ProUsersPage() {
  const router = useRouter();

  const [users, setUsers] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers =
    async () => {
      try {
        const querySnapshot =
          await getDocs(
            collection(
              db,
              "users"
            )
          );

        const usersData =
          querySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter(
              (user: any) =>
                user.proRequest ===
                true
            );

        setUsers(
          usersData
        );

        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

  const approveProUser =
    async (
      userId: string
    ) => {
      try {
        await updateDoc(
          doc(
            db,
            "users",
            userId
          ),
          {
            membership:
              "pro",

            proApproved:
              true,

            proRequest:
              false,

            verifiedSeller:
              true,

            monthlyAdLimit:
              30,

            featuredCredits:
              10,
          }
        );

        alert(
          "User upgraded to PRO!"
        );

        fetchUsers();
      } catch (error) {
        console.log(error);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center text-2xl">
        Loading Pro Requests...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white flex">

      {/* Sidebar */}
      <div className="w-72 bg-[#0f172a] border-r border-gray-800 p-6">

        <h1 className="text-3xl font-bold mb-10">
          ⚙️ Admin
        </h1>

        <div className="space-y-4">

          <button
            onClick={() =>
              router.push(
                "/admin"
              )
            }
            className="w-full bg-[#111827] hover:bg-[#1f2937] rounded-2xl p-4 text-left"
          >
            📊 Dashboard
          </button>

          <button
            onClick={() =>
              router.push(
                "/admin/users"
              )
            }
            className="w-full bg-[#111827] hover:bg-[#1f2937] rounded-2xl p-4 text-left"
          >
            👥 Users
          </button>

          <button
            onClick={() =>
              router.push(
                "/admin/listings"
              )
            }
            className="w-full bg-[#111827] hover:bg-[#1f2937] rounded-2xl p-4 text-left"
          >
            📦 Listings
          </button>

          <button
            className="w-full bg-yellow-500 text-black rounded-2xl p-4 text-left font-bold"
          >
            ⭐ Pro Requests
          </button>

        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-8">

        <h1 className="text-4xl font-bold mb-8 text-yellow-400">
          ⭐ Pro Seller Requests
        </h1>

        <div className="bg-[#111827] rounded-3xl overflow-hidden border border-yellow-500/20">

          <table className="w-full">

            <thead className="bg-[#0f172a]">
              <tr>
                <th className="p-5 text-left">
                  Email
                </th>

                <th className="p-5 text-left">
                  Country
                </th>

                <th className="p-5 text-left">
                  Phone
                </th>

                <th className="p-5 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {users.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center text-gray-400"
                  >
                    No pending
                    requests
                  </td>
                </tr>
              ) : (
                users.map(
                  (user) => (
                    <tr
                      key={
                        user.id
                      }
                      className="border-t border-gray-800"
                    >
                      <td className="p-5">
                        {
                          user.email
                        }
                      </td>

                      <td className="p-5">
                        {
                          user.country
                        }
                      </td>

                      <td className="p-5">
                        {
                          user.phone
                        }
                      </td>

                      <td className="p-5">

                        <button
                          onClick={() =>
                            approveProUser(
                              user.id
                            )
                          }
                          className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-bold"
                        >
                          ✅ Approve
                        </button>

                      </td>
                    </tr>
                  )
                )
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
